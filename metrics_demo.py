def calculate_total(a, b):
    return a + b


if __name__ == "__main__":
    print(calculate_total(10, 20))


def test_create_task_rejects_non_string_description(client):
    response = client.post(
        "/tasks",
        json={"title": "Valid task", "description": 123},
    )
    assert response.status_code == 400


def test_create_task_trims_title_and_description(client):
    response = client.post(
        "/tasks",
        json={"title": "  Valid task  ", "description": "  Details  "},