<?php
require_once __DIR__ . '/../includes/functions.php';

$sql = 'SELECT id, name, description FROM divisions ORDER BY sort_order, id';

send_json(db()->query($sql)->fetchAll());