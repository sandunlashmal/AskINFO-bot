<?php
require_once __DIR__ . '/../includes/functions.php';

// only logged in admins
require_admin();

// fields the admin can fill
const DIVISION_FIELDS = [
    'name', 'name_si', 'name_ta',
    'description', 'description_si', 'description_ta',
    'sort_order',
];

// check the data before saving
function division_data(): array
{
    $data = pick(get_body(), DIVISION_FIELDS);

    if ($data['name'] === null) {
        send_error('Please enter the division name in English.');
    }

    // sort_order is the place of the button in the menu (1, 2, 3 ...)
    if ($data['sort_order'] === null) {
        // not given: put it at the end
        $data['sort_order'] = db()->query('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM divisions')->fetchColumn();
    } elseif (filter_var($data['sort_order'], FILTER_VALIDATE_INT) === false) {
        send_error('The order must be a whole number.');
    }
    return $data;
}

// count rows in a table that belong to this division
function count_in_division(string $table, int $id): int
{
    $stmt = db()->prepare("SELECT COUNT(*) FROM `$table` WHERE division_id = ?");
    $stmt->execute([$id]);
    return (int) $stmt->fetchColumn();
}

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // all divisions with all languages
        $sql = 'SELECT id, ' . implode(', ', DIVISION_FIELDS)
             . ' FROM divisions ORDER BY sort_order, id';
        send_json(db()->query($sql)->fetchAll());

    case 'POST':
        // add a new division
        $id = insert_row('divisions', division_data());
        send_json(['id' => $id, 'message' => 'Division added.'], 201);

    case 'PUT':
        // edit a division
        $id = get_id('id');
        if (!row_exists('divisions', $id)) {
            send_error('Division not found.', 404);
        }
        update_row('divisions', $id, division_data());
        send_json(['id' => $id, 'message' => 'Division saved.']);

    case 'DELETE':
        // delete a division
        $id = get_id('id');
        if (!row_exists('divisions', $id)) {
            send_error('Division not found.', 404);
        }
        // do not delete a division that still has services or officers
        if (count_in_division('services', $id) > 0 || count_in_division('officers', $id) > 0) {
            send_error('This division still has services or officers. Move or delete them first.', 409);
        }
        db()->prepare('DELETE FROM divisions WHERE id = ?')->execute([$id]);
        send_json(['message' => 'Division deleted.']);

    default:
        send_error('This method is not allowed.', 405);
}