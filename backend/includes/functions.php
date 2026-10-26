<?php
require_once __DIR__ . '/../config.php';

// Every API answer is JSON
header('Content-Type: application/json; charset=utf-8');

// Connect to MySQL once and reuse the connection
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

// Send data as JSON and stop
function send_json($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
// Read ?lang= from the URL. Anything unknown becomes 'en'
function get_lang(): string
{
    $lang = $_GET['lang'] ?? 'en';
    return in_array($lang, LANGUAGES, true) ? $lang : 'en';
}

// One text column in the chosen language.
// If the Sinhala/Tamil text is empty, the English text is used.
function lang_col(string $column, string $lang, string $table = ''): string
{
    $prefix  = $table ? $table . '.' : '';
    $english = $prefix . '`' . $column . '`';
    if ($lang === 'en') {
        return "$english AS `$column`";
    }
    $translated = $prefix . '`' . $column . '_' . $lang . '`';
    return "COALESCE(NULLIF($translated, ''), $english) AS `$column`";
}

// Send an error message as JSON and stop
function send_error(string $message, int $status = 400): void
{
    send_json(['error' => $message], $status);
}

// Read a required whole-number id from the URL, e.g. ?id=4
function get_id(string $name): int
{
    $value = filter_input(INPUT_GET, $name, FILTER_VALIDATE_INT);
    if (!$value || $value < 1) {
        send_error("Please send a valid '$name'.");
    }
    return $value;
}
