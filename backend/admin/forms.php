<?php
require_once __DIR__ . '/../includes/functions.php';

// only logged in admins
require_admin();

// biggest PDF we allow (5 MB)
const MAX_PDF_SIZE = 5 * 1024 * 1024;
// folder where the PDFs are saved
const FORMS_FOLDER = 'uploads/forms/';

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // all forms of one service
        $stmt = db()->prepare('SELECT id, title, title_si, title_ta, file_path'
                            . ' FROM forms WHERE service_id = ? ORDER BY id');
        $stmt->execute([get_id('service_id')]);
        $forms = $stmt->fetchAll();
        // add the full link to open each PDF
        foreach ($forms as &$form) {
            $form['url'] = BASE_URL . '/' . $form['file_path'];
        }
        send_json($forms);

    case 'POST':
        // a file comes as form data ($_POST and $_FILES), not JSON
        $data = pick($_POST, ['service_id', 'title', 'title_si', 'title_ta']);
        $file = $_FILES['file'] ?? null;

        if (!row_exists('services', $data['service_id'])) {
            send_error('Please choose a valid service.');
        }
        if ($data['title'] === null) {
            send_error('Please enter the form title in English.');
        }
        // check a file was sent
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            send_error('Please choose a PDF file.');
        }
        if ($file['size'] > MAX_PDF_SIZE) {
            send_error('The PDF must be smaller than 5 MB.');
        }
        // a real PDF file always starts with "%PDF"
        if (file_get_contents($file['tmp_name'], false, null, 0, 4) !== '%PDF') {
            send_error('Only PDF files can be uploaded.');
        }

        // make our own file name, e.g. form_1_6720f1c2a9b3e.pdf
        $data['file_path'] = FORMS_FOLDER . 'form_' . $data['service_id'] . '_' . uniqid() . '.pdf';
        // move the file from the temp folder to our folder
        if (!move_uploaded_file($file['tmp_name'], __DIR__ . '/../' . $data['file_path'])) {
            send_error('The file could not be saved. Please try again.', 500);
        }

        $id = insert_row('forms', $data);
        send_json(['id' => $id, 'url' => BASE_URL . '/' . $data['file_path'],
                   'message' => 'Form uploaded.'], 201);

    case 'DELETE':
        // find the form first to get the file name
        $id   = get_id('id');
        $stmt = db()->prepare('SELECT file_path FROM forms WHERE id = ?');
        $stmt->execute([$id]);
        $form = $stmt->fetch();
        if (!$form) {
            send_error('Form not found.', 404);
        }
        // delete the PDF file, then the row
        @unlink(__DIR__ . '/../' . $form['file_path']);
        db()->prepare('DELETE FROM forms WHERE id = ?')->execute([$id]);
        send_json(['message' => 'Form deleted.']);

    default:
        send_error('This method is not allowed.', 405);
}