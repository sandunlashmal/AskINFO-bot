<?php
require_once __DIR__ . '/../includes/functions.php';

// only logged in admins
require_admin();

// fields the admin can fill
const SERVICE_FIELDS = [
    'division_id', 'officer_id',
    'title', 'title_si', 'title_ta',
    'description', 'description_si', 'description_ta',
    'procedure', 'procedure_si', 'procedure_ta',
    'required_documents', 'required_documents_si', 'required_documents_ta',
    'fee',
    'processing_time', 'processing_time_si', 'processing_time_ta',
];

// check the data before saving
function service_data(): array
{
    $data = pick(get_body(), SERVICE_FIELDS);

    if ($data['title'] === null) {
        send_error('Please enter the service title in English.');
    }
    if (!row_exists('divisions', $data['division_id'])) {
        send_error('Please choose a valid division.');
    }
    if ($data['officer_id'] !== null && !row_exists('officers', $data['officer_id'])) {
        send_error('Please choose a valid officer.');
    }
    return $data;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // one service with all languages
        if (isset($_GET['id'])) {
            $id   = get_id('id');
            $stmt = db()->prepare('SELECT * FROM services WHERE id = ?');
            $stmt->execute([$id]);
            $service = $stmt->fetch();
            if (!$service) {
                send_error('Service not found.', 404);
            }
            send_json($service);
        }

        // list of services (can filter by division)
        $sql = 'SELECT s.id, s.title, s.division_id, d.name AS division_name'
             . ' FROM services s JOIN divisions d ON d.id = s.division_id';
        $params = [];
        if (isset($_GET['division_id'])) {
            $sql .= ' WHERE s.division_id = ?';
            $params[] = get_id('division_id');
        }
        $stmt = db()->prepare($sql . ' ORDER BY d.sort_order, s.title');
        $stmt->execute($params);
        send_json($stmt->fetchAll());

    case 'POST':
        // add a new service
        $id = insert_row('services', service_data());
        send_json(['id' => $id, 'message' => 'Service added.'], 201);

    case 'PUT':
        // edit a service
        $id = get_id('id');
        if (!row_exists('services', $id)) {
            send_error('Service not found.', 404);
        }
        update_row('services', $id, service_data());
        send_json(['id' => $id, 'message' => 'Service saved.']);

    case 'DELETE':
        // delete a service
        $id = get_id('id');
        if (!row_exists('services', $id)) {
            send_error('Service not found.', 404);
        }
        // delete its PDF files too
        $stmt = db()->prepare('SELECT file_path FROM forms WHERE service_id = ?');
        $stmt->execute([$id]);
        foreach ($stmt->fetchAll() as $form) {
            @unlink(__DIR__ . '/../' . $form['file_path']);
        }
        db()->prepare('DELETE FROM services WHERE id = ?')->execute([$id]);
        send_json(['message' => 'Service deleted.']);

    default:
        send_error('This method is not allowed.', 405);
}