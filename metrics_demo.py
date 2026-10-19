from datetime import datetime


def calculate_total(a, b):
    return a + b


def calculate_multiplication(a, b):
    return a * b


def calculate_subtraction(a, b):
    return a - b


def calculate_division(a, b):
    return a / b


def ai_authored_percentage(ai_lines, total_lines, ndigits=2):
    """Return the percentage of changed lines that were AI-authored.

    Args:
        ai_lines: Number of added/changed lines attributed to an AI assistant.
        total_lines: Total number of added/changed lines in the same scope
            (e.g. a commit, pull request, or repository over a time window).
        ndigits: Decimal places to round the result to.

    Returns:
        A float between 0 and 100. Returns 0.0 when ``total_lines`` is 0.

    Raises:
        ValueError: If either count is negative or ``ai_lines`` exceeds
            ``total_lines``.
    """
    if ai_lines < 0 or total_lines < 0:
        raise ValueError("line counts must be non-negative")
    if ai_lines > total_lines:
        raise ValueError("ai_lines cannot exceed total_lines")
    if total_lines == 0:
        return 0.0
    return round(ai_lines / total_lines * 100, ndigits)


if __name__ == "__main__":
    print(calculate_total(10, 20))
    print(ai_authored_percentage(45, 120))


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


def test_ai_authored_percentage():
    assert ai_authored_percentage(45, 120) == 37.5
    assert ai_authored_percentage(1, 3) == 33.33
    assert ai_authored_percentage(0, 0) == 0.0
    assert ai_authored_percentage(50, 50) == 100.0


def test_ai_authored_percentage_rejects_invalid_counts():
    import pytest

    with pytest.raises(ValueError):
        ai_authored_percentage(-1, 10)
    with pytest.raises(ValueError):
        ai_authored_percentage(11, 10)

def deploys_per_week(deploys, weeks):
    return deploys / weeks if weeks else 0.0


def lead_time_hours(first_commit_iso, deployed_iso):
    """Return the hours between the first commit and deployment as a float.

    Both arguments are ISO-8601 timestamps; a trailing "Z" is treated as UTC.
    """
    start = datetime.fromisoformat(first_commit_iso.replace("Z", "+00:00"))
    end = datetime.fromisoformat(deployed_iso.replace("Z", "+00:00"))
    return (end - start).total_seconds() / 3600


def rework_rate(reworked_prs, merged_prs):
    """Share of merged PRs that needed rework (M10)."""
    if merged_prs == 0:
        return 0.0
    return reworked_prs / merged_prs


def review_wait_hours(ready_iso, reviewed_iso):
    """Hours from ready-for-review to the first review."""
    if not ready_iso or not reviewed_iso:
        return None
    return lead_time_hours(ready_iso, reviewed_iso)

