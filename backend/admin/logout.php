<?php
require_once __DIR__ . '/../includes/functions.php';

require_method('POST');

// clear the session
start_session();
$_SESSION = [];
session_destroy();

send_json(['message' => 'Logged out.']);