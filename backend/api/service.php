<?php
require_once __DIR__ . '/../includes/functions.php';

$lang = get_lang();
$id   = get_id('id');

// 1. The service and its division name
$sql = 'SELECT s.id, s.division_id, '
     . lang_col('name', $lang, 'd') . ', '
     . lang_col('title', $lang, 's') . ', '
     . lang_col('description', $lang, 's') . ', '
     . lang_col('procedure', $lang, 's') . ', '
     . lang_col('required_documents', $lang, 's') . ', '
     . 's.fee, '
     . lang_col('processing_time', $lang, 's') . ', '
     . 's.officer_id'
     . ' FROM services s JOIN divisions d ON d.id = s.division_id'
     . ' WHERE s.id = ?';

$stmt = db()->prepare($sql);
$stmt->execute([$id]);
$service = $stmt->fetch();

if (!$service) {
    send_error('Service not found.', 404);
}

// "name" is the division name; give it a clearer key
$service['division_name'] = $service['name'];
unset($service['name']);

// 2. The officer (a service may have no officer)
$service['officer'] = null;
if ($service['officer_id']) {
    $stmt = db()->prepare('SELECT id, name, ' . lang_col('designation', $lang)
                        . ', phone, email FROM officers WHERE id = ?');
    $stmt->execute([$service['officer_id']]);
    $service['officer'] = $stmt->fetch() ?: null;
}
unset($service['officer_id']);

// 3. PDF forms, with a full download link
$stmt = db()->prepare('SELECT id, ' . lang_col('title', $lang)
                    . ', file_path FROM forms WHERE service_id = ? ORDER BY id');
$stmt->execute([$id]);
$forms = $stmt->fetchAll();
foreach ($forms as &$form) {
    $form['url'] = BASE_URL . '/' . $form['file_path'];
    unset($form['file_path']);
}
$service['forms'] = $forms;

send_json($service);