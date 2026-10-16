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



    def test_get_missing_task_returns_404(client):
        response = client.get("/tasks/not-a-real-id")
    assert response.status_code == 404


def test_patch_task(client):
    created = client.post("/tasks", json={"title": "Draft"})
    task_id = created.get_json()["task"]["id"]

    updated = client.patch(f"/tasks/{task_id}", json={"completed": True, "title": "Drafted"})
    assert updated.status_code == 200
    assert updated.get_json()["task"]["completed"] is True
    assert updated.get_json()["task"]["title"] == "Drafted"