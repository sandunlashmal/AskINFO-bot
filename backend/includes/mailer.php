<?php
// =====================================================================
// Email for "Forgot password": settings in the database and a small
// SMTP client (Gmail: smtp.gmail.com, port 465 or 587, App password).
// =====================================================================

require_once __DIR__ . '/functions.php';

// APP_KEY is in backend/secret.php. That file is NOT on GitHub (.gitignore).
if (is_file(__DIR__ . '/../secret.php')) {
    require_once __DIR__ . '/../secret.php';
}
if (!defined('APP_KEY')) {
    send_error('backend/secret.php with APP_KEY is missing. Please contact the IT officer.', 500);
}

// Gmail by default. Another mail server? Add SMTP_HOST / SMTP_PORT to config.php
if (!defined('SMTP_HOST')) {
    define('SMTP_HOST', 'smtp.gmail.com');
}
// No SMTP_PORT in config.php: try port 465 first, then 587
// (some networks block one of them)

// Read one setting (null if not saved yet)
function get_setting(string $name): ?string
{
    $stmt = db()->prepare('SELECT value FROM settings WHERE name = ?');
    $stmt->execute([$name]);
    $value = $stmt->fetchColumn();
    return $value === false ? null : $value;
}

// Save one setting (add or replace)
function save_setting(string $name, ?string $value): void
{
    db()->prepare('REPLACE INTO settings (name, value) VALUES (?, ?)')->execute([$name, $value]);
}

// The App password is saved locked (encrypted) with APP_KEY from secret.php
function lock_text(string $text): string
{
    $iv = random_bytes(16);
    $locked = openssl_encrypt($text, 'aes-256-cbc', hash('sha256', APP_KEY, true), OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $locked);
}

function unlock_text(?string $saved): ?string
{
    if (!$saved) {
        return null;
    }
    $raw = base64_decode($saved);
    $text = openssl_decrypt(substr($raw, 16), 'aes-256-cbc', hash('sha256', APP_KEY, true), OPENSSL_RAW_DATA, substr($raw, 0, 16));
    return $text === false ? null : $text;
}

// Are the email settings saved?
function mail_ready(): bool
{
    return get_setting('mail_email') && get_setting('mail_password');
}

// Send a plain text email. Throws an exception with a simple message on error.
function send_mail(string $to, string $subject, string $body): void
{
    $from = get_setting('mail_email');
    if (!$from || !get_setting('mail_password')) {
        throw new RuntimeException('The email settings are not saved yet.');
    }
    // can not unlock = APP_KEY in secret.php was changed after saving
    $password = unlock_text(get_setting('mail_password'));
    if (!$password) {
        throw new RuntimeException('The App password can not be read. Please type it again in Email settings and save.');
    }

    // port 465 = safe (encrypted) from the start, other ports = STARTTLS later
    $ports = defined('SMTP_PORT') ? [SMTP_PORT] : [465, 587];
    $socket = false;
    foreach ($ports as $port) {
        $secure = ((int) $port === 465);
        $address = ($secure ? 'ssl://' : 'tcp://') . SMTP_HOST . ':' . $port;
        $socket = @stream_socket_client($address, $errorNo, $errorText, 10);
        if ($socket) {
            break;
        }
    }
    if (!$socket) {
        throw new RuntimeException('Could not connect to the mail server. Check the internet connection.');
    }
    stream_set_timeout($socket, 15);

    // read the server answer (it can have many lines; the last one has a space after the code)
    $read = function () use ($socket): string {
        $answer = '';
        while (($line = fgets($socket, 515)) !== false) {
            $answer .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        return $answer;
    };
    // send one command and check the answer code, e.g. 250 = OK
    $command = function (?string $text, int $expected) use ($socket, $read): string {
        if ($text !== null) {
            fwrite($socket, $text . "\r\n");
        }
        $answer = $read();
        if ((int) substr($answer, 0, 3) !== $expected) {
            throw new RuntimeException('Mail server: ' . trim($answer));
        }
        return $answer;
    };

    $command(null, 220);
    $hello = $command('EHLO askinfo-bot', 250);
    // switch to a safe (encrypted) connection
    if (!$secure && stripos($hello, 'STARTTLS') !== false) {
        $command('STARTTLS', 220);
        if (!@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('Could not make a safe connection to the mail server.');
        }
        $command('EHLO askinfo-bot', 250);
    }

    // log in with the email and the App password
    $command('AUTH LOGIN', 334);
    $command(base64_encode($from), 334);
    try {
        $command(base64_encode($password), 235);
    } catch (RuntimeException $e) {
        throw new RuntimeException('The email or the App password is wrong.');
    }

    $command("MAIL FROM:<$from>", 250);
    $command("RCPT TO:<$to>", 250);
    $command('DATA', 354);

    // UTF-8 so that Sinhala and Tamil work
    $message = 'From: "Ask INFO bot" <' . $from . ">\r\n"
             . "To: <$to>\r\n"
             . 'Subject: =?UTF-8?B?' . base64_encode($subject) . "?=\r\n"
             . 'Date: ' . date('r') . "\r\n"
             . "MIME-Version: 1.0\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n"
             . "Content-Transfer-Encoding: base64\r\n\r\n"
             . chunk_split(base64_encode($body));
    $command($message . "\r\n.", 250);
    $command('QUIT', 221);
    fclose($socket);
}
