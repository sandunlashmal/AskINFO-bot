<?php
require_once __DIR__ . '/../includes/functions.php';

// login works only with POST
require_method('POST');

$body     = get_body();
$email    = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

// both fields are needed
if ($email === '' || $password === '') {
    send_error('Please enter your email and password.');
}

// find the admin by email
$stmt = db()->prepare('SELECT id, name, password FROM admins WHERE email = ?');
$stmt->execute([$email]);
$admin = $stmt->fetch();

// check the password with the saved hash
if (!$admin || !password_verify($password, $admin['password'])) {
    sleep(1); // wait 1 second to slow down password guessing
    send_error('Wrong email or password.', 401);
}

// save the admin in the session
start_session();
session_regenerate_id(true); // new session id after login
$_SESSION['admin_id']   = $admin['id'];
$_SESSION['admin_name'] = $admin['name'];

send_json(['id' => $admin['id'], 'name' => $admin['name']]);