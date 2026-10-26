<?php
require_once __DIR__ . '/../includes/functions.php';

$lang       = get_lang();
$divisionId = get_id('division_id');

$sql = 'SELECT id, ' . lang_col('title', $lang)
     . ' FROM services WHERE division_id = ? ORDER BY title, id';

$stmt = db()->prepare($sql);
$stmt->execute([$divisionId]);

send_json($stmt->fetchAll());