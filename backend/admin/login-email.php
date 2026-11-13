<?php
// Admin: change the email used to log in
//   GET  admin/login-email.php   {email}  the login email now
//   POST admin/login-email.php   save {email, current_password}
// The password does not change. The admin stays logged in.

require_once __DIR__ . '/../includes/functions.php';

$adminId = require_admin();

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $stmt = db()->prepare('SELECT email FROM admins WHERE id = ?');
        $stmt->execute([$adminId]);
        send_json(['email' => $stmt->fetchColumn() ?: '']);

    case 'POST':
        $body    = get_body();
        // only text is allowed in the boxes
        $email   = is_string($body['email'] ?? null) ? strtolower(trim($body['email'])) : '';
        $current = is_string($body['current_password'] ?? null) ? $body['current_password'] : '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
            send_error('Please enter a valid email address.');
        }

        // check the current password first
        $stmt = db()->prepare('SELECT email, password FROM admins WHERE id = ?');
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();
        if (!$admin || !password_verify($current, $admin['password'])) {
            sleep(1); // wait 1 second to slow down password guessing
            send_error('Your current password is wrong.', 401);
        }

        if (strcasecmp($email, $admin['email']) === 0) {
            send_error('This is already the login email.');
        }

        // two admins can not have the same login email
        $stmt = db()->prepare('SELECT id FROM admins WHERE email = ? AND id <> ?');
        $stmt->execute([$email, $adminId]);
        if ($stmt->fetch()) {
            send_error('Another admin already uses this email.');
        }

        update_row('admins', $adminId, ['email' => $email]);

        send_json(['message' => 'Login email changed.', 'email' => $email]);
}

send_error('This method is not allowed.', 405);
