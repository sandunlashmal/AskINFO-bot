<?php
require_once __DIR__ . '/../includes/functions.php';

$lang = get_lang();

$sql = 'SELECT id, '
     . lang_col('name', $lang) . ', '
     . lang_col('description', $lang)
     . ' FROM divisions ORDER BY sort_order, id';

send_json(db()->query($sql)->fetchAll());