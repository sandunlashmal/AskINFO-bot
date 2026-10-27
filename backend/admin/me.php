<?php
require_once __DIR__ . '/../includes/functions.php';

// show the logged in admin
$id = require_admin();

send_json(['id' => $id, 'name' => $_SESSION['admin_name']]);