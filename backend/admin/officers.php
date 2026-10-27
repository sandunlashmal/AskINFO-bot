<?php
require_once __DIR__ . '/../includes/functions.php';

// only logged in admins
require_admin();

// fields the admin can fill
const OFFICER_FIELDS = [
    'division_id', 'name',
    'designation', 'designation_si', 'designation_ta',
    'phone', 'email',
];

// check the data before saving
function officer_data(): array
{
    $data = pick(get_body(), OFFICER_FIELDS);

    if (!row_exists('divisions', $data['division_id'])) {
        send_error('Please choose a valid division.');
    }
    if ($data['name'] === null || $data['designation'] === null) {
        send_error('Please enter the name and the designation in English.');
    }
    // email is optional, but if given it must be valid
    if ($data['email'] !== null && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        send_error('Please enter a valid email address.');
    }
    return $data;
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // officers with their division name
        $sql = 'SELECT o.*, d.name AS division_name'
             . ' FROM officers o JOIN divisions d ON d.id = o.division_id';
        $params = [];
        // only one division if division_id is given
        if (isset($_GET['division_id'])) {
            $sql .= ' WHERE o.division_id = ?';
            $params[] = get_id('division_id');
        }
        $stmt = db()->prepare($sql . ' ORDER BY d.sort_order, o.name');
        $stmt->execute($params);
        send_json($stmt->fetchAll());

    case 'POST':
        // add a new officer
        $id = insert_row('officers', officer_data());
        send_json(['id' => $id, 'message' => 'Officer added.'], 201);

    case 'PUT':
        // edit an officer
        $id = get_id('id');
        if (!row_exists('officers', $id)) {
            send_error('Officer not found.', 404);
        }
        update_row('officers', $id, officer_data());
        send_json(['id' => $id, 'message' => 'Officer saved.']);

    case 'DELETE':
        // delete an officer (their services stay, officer becomes empty)
        $id = get_id('id');
        if (!row_exists('officers', $id)) {
            send_error('Officer not found.', 404);
        }
        db()->prepare('DELETE FROM officers WHERE id = ?')->execute([$id]);
        send_json(['message' => 'Officer deleted.']);

    default:
        send_error('This method is not allowed.', 405);
}