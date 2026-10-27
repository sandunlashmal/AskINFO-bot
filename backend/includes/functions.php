<?php
require_once __DIR__ . '/../config.php';

// Every API answer is JSON
header('Content-Type: application/json; charset=utf-8');

header('Access-Control-Allow-Origin: ' . FRONTEND_URL);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// The browser sends an OPTIONS request first for some calls. Answer and stop.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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


// Any database error: log it, and give the user a simple message
set_exception_handler(function (Throwable $e) {
    error_log('[askinfo-bot] ' . $e->getMessage());
    send_error('Something went wrong on the server. Please try again.', 500);
});


// check the request method
function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        send_error("Please use $method for this request.", 405);
    }
}

// get the JSON data sent in the request
function get_body(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

// start the session to remember the logged in admin
function start_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
        session_start();
    }
}

// only allow logged in admins
function require_admin(): int
{
    start_session();
    if (empty($_SESSION['admin_id'])) {
        send_error('Please log in first.', 401);
    }
    return $_SESSION['admin_id'];
}