<?php
// POST admin/reset.php   body: {"token": "...", "new_password": "..."}
// Sets a new password with the code from the reset email.

require_once __DIR__ . '/../includes/functions.php';

require_method('POST');

$body = get_body();
$token = $body['token'] ?? '';
$new = $body['new_password'] ?? '';

if (strlen($new) < 8) {
    send_error('The new password must have at least 8 characters.');
}

// the code must be right and not older than 30 minutes
$stmt = db()->prepare('SELECT id FROM admins WHERE reset_token = ? AND reset_expires > NOW()');
$stmt->execute([hash('sha256', $token)]);
$adminId = $stmt->fetchColumn();

if (!$adminId) {
    send_error('This reset link is wrong or too old. Please ask for a new one.', 410);
}

// new password, and the code can not be used again
db()->prepare('UPDATE admins SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?')
    ->execute([password_hash($new, PASSWORD_DEFAULT), $adminId]);

send_json(['message' => 'Password changed.']);
