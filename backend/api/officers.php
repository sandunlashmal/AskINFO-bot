<?php
require_once __DIR__ . '/../includes/functions.php';

$lang       = get_lang();
$divisionId = get_id('division_id');

$sql = 'SELECT id, name, ' . lang_col('designation', $lang)
     . ', phone, email FROM officers WHERE division_id = ? ORDER BY name, id';

$stmt = db()->prepare($sql);
$stmt->execute([$divisionId]);

send_json($stmt->fetchAll());