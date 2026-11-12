<?php
// Admin: the office email for "Forgot password"
// The reset links are sent FROM this email TO this same email.
//   GET    admin/email-settings.php            {email, has_password}
//   POST   admin/email-settings.php            save {email, app_password}
//   POST   admin/email-settings.php?test=1     send a test email to the office email
//   DELETE admin/email-settings.php            remove the email ("Forgot password" is off)

require_once __DIR__ . '/../includes/mailer.php';

require_admin();

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // never send the App password back, only say if it is saved
        send_json([
            'email'        => get_setting('mail_email') ?? '',
            'has_password' => (bool) get_setting('mail_password'),
        ]);

    case 'POST':
        if (isset($_GET['test'])) {
            if (!mail_ready()) {
                send_error('Please save the email and the App password first.');
            }
            $to = get_setting('mail_email');
            try {
                send_mail($to, 'Ask INFO bot - test email',
                    "This is a test email from the Ask INFO bot admin panel.\n"
                    . "The email settings work. \"Forgot password\" links will come to this email.\n\n"
                    . "මෙය Ask INFO bot පරිපාලක පුවරුවෙන් එවූ පරීක්ෂණ ඊමේල් පණිවිඩයකි.\n"
                    . "ඊමේල් සැකසුම් නිවැරදිව ක්‍රියා කරයි. මුරපදය අමතක වූ විට සබැඳිය මෙම ඊමේල් ලිපිනයට ලැබේ.");
            } catch (RuntimeException $e) {
                send_error($e->getMessage(), 502);
            }
            send_json(['message' => "Test email sent to $to."]);
        }

        $body = get_body();
        $email = strtolower(trim($body['email'] ?? ''));
        // Google shows the App password with spaces: remove them
        $appPassword = str_replace(' ', '', $body['app_password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_error('Please enter a valid email address.');
        }
        // a new email needs its own App password
        $sameEmail = strcasecmp($email, get_setting('mail_email') ?? '') === 0;
        if ($appPassword === '' && (!$sameEmail || !get_setting('mail_password'))) {
            send_error('Please enter the App password of this email.');
        }
        if ($appPassword !== '' && strlen($appPassword) !== 16) {
            send_error('The App password must have 16 letters.');
        }

        save_setting('mail_email', $email);
        // empty box = keep the old App password
        if ($appPassword !== '') {
            save_setting('mail_password', lock_text($appPassword));
        }
        send_json(['message' => 'Email settings saved.']);

    case 'DELETE':
        db()->prepare("DELETE FROM settings WHERE name IN ('mail_email', 'mail_password')")->execute();
        send_json(['message' => 'Email removed.']);

    default:
        send_error('This method is not allowed.', 405);
}
