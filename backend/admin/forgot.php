<?php
// "Forgot password" (open to everyone, no login)
//   GET  admin/forgot.php   {ready, to}  is reset by email set up? to = the office email, partly hidden
//   POST admin/forgot.php   body: {"email": "..."}  the login email
//                           The reset link goes to the office email from "Email settings".

require_once __DIR__ . '/../includes/mailer.php';

// "rattotads@gmail.com" -> "r•••••••s@gmail.com" (the public must not see the whole email)
function hide_email(string $email): string
{
    [$name, $domain] = explode('@', $email, 2);
    if (strlen($name) <= 2) {
        return $name[0] . '•••@' . $domain;
    }
    return $name[0] . str_repeat('•', min(strlen($name) - 2, 8)) . substr($name, -1) . '@' . $domain;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ready = mail_ready();
    send_json([
        'ready' => $ready,
        'to'    => $ready ? hide_email(get_setting('mail_email')) : null,
    ]);
}

require_method('POST');

if (!mail_ready()) {
    send_error('Password reset by email is not set up.', 503);
}

$email = trim(get_body()['email'] ?? '');
if ($email === '') {
    send_error('Please enter the login email.');
}

sleep(1); // slow down anyone trying many emails

// recent = a link was sent less than 1 minute ago
$stmt = db()->prepare('SELECT id, name, reset_expires > DATE_ADD(NOW(), INTERVAL 29 MINUTE) AS recent FROM admins WHERE email = ?');
$stmt->execute([$email]);
$admin = $stmt->fetch();

// Same answer for a wrong email, so nobody can find out the login email
$to = get_setting('mail_email');
$answer = ['message' => 'If this is the staff login email, a reset link was sent.', 'to' => hide_email($to)];
// a wrong email, or many clicks: send no new email (the answer is the same)
if (!$admin || $admin['recent']) {
    send_json($answer);
}

// A long random code. We save only its hash, the code itself goes in the email.
$token = bin2hex(random_bytes(32));
db()->prepare('UPDATE admins SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?')
    ->execute([hash('sha256', $token), $admin['id']]);

$link = FRONTEND_URL . '/admin/reset?token=' . $token;
try {
    send_mail($to, 'Ask INFO bot - reset the staff password',
        "Someone asked to reset the password of the staff login ($email).\n\n"
        . "Click this link to choose a new password. It works for 30 minutes.\n"
        . "$link\n\n"
        . "කාර්ය මණ්ඩල පිවිසුමේ මුරපදය නැවත සැකසීමට ඉහත සබැඳිය ක්ලික් කරන්න. එය මිනිත්තු 30ක් පමණක් වලංගු වේ.\n\n"
        . "Did not ask for this? Then do nothing. The password stays the same.\n"
        . "ඔබ මෙය ඉල්ලා නොමැති නම්, කිසිවක් කිරීමට අවශ්‍ය නැත. මුරපදය වෙනස් නොවේ.");
} catch (RuntimeException $e) {
    error_log('[askinfo-bot] reset email: ' . $e->getMessage());
    send_error('The email could not be sent. Please contact the IT officer.', 502);
}

send_json($answer);
