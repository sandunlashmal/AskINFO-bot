<?php
require_once __DIR__ . '/../includes/functions.php';

// only POST, only logged in admins
require_method('POST');
$adminId = require_admin();

$body    = get_body();
$current = $body['current_password'] ?? '';
$new     = $body['new_password'] ?? '';

// the new password must be long enough
if (strlen($new) < 8) {
    send_error('The new password must have at least 8 characters.');
}

// get the saved password (hash) of this admin
$stmt = db()->prepare('SELECT password FROM admins WHERE id = ?');
$stmt->execute([$adminId]);
$admin = $stmt->fetch();

// check the current password is right
if (!$admin || !password_verify($current, $admin['password'])) {
    send_error('Your current password is wrong.', 401);
}

// save only the hash, never the real password
update_row('admins', $adminId, ['password' => password_hash($new, PASSWORD_DEFAULT)]);

send_json(['message' => 'Password changed.']);