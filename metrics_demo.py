import pytest

from app import create_app
from task_store import TaskStore

def calculate_total(a, b):
    return a + b


if __name__ == "__main__":
    print(calculate_total(10, 20))

@pytest.fixture()
def client():
    app = create_app(TaskStore())
    app.config.update(TESTING=True)
    with app.test_client() as test_client:
        yield test_client


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}

def test_create_task_rejects_non_string_description(client):
    response = client.post(
        "/tasks",
        json={"title": "Valid task", "description": 123},
    )
    assert response.status_code == 400

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