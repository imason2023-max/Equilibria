"""Pytest suite for Equilibria backend (Kadeem section)."""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_check_status():
    r = client.get("/check-status")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "timestamp" in data


def test_create_and_get_profile():
    payload = {
        "user_id": 10,
        "name": "Test User",
        "age": 25,
        "training_goal": "strength",
    }
    r = client.post("/profile", json=payload)
    assert r.status_code == 200
    created = r.json()
    assert created["user_id"] == 10

    r2 = client.get("/profile/10")
    assert r2.status_code == 200
    fetched = r2.json()
    assert fetched["name"] == "Test User"


def test_patch_profile():
    payload = {"user_id": 11, "name": "Original", "age": 28, "training_goal": "endurance"}
    client.post("/profile", json=payload)

    patch_payload = {"name": "Updated Name"}
    r = client.patch("/profile/11", json=patch_payload)
    assert r.status_code == 200
    updated = r.json()
    assert updated["name"] == "Updated Name"
    assert updated["training_goal"] == "endurance"


def test_evaluate_recovery():
    payload = {
        "sleep_hours": 7.0,
        "soreness": 3.0,
        "energy": 8.0,
        "last_set_weight": 225.0,
        "last_set_reps": 5,
    }
    r = client.post("/recovery/evaluate", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert 1.0 <= data["recovery_score"] <= 10.0
    assert "recommendation" in data
    assert data["today_estimated_1rm"] > 0


def test_weekly_insights():
    payload = {"user_id": 12, "name": "Insights User", "age": 27, "training_goal": "hypertrophy"}
    client.post("/profile", json=payload)

    r = client.get("/insights/weekly/12")
    assert r.status_code == 200
    data = r.json()
    assert data["user_id"] == 12
    assert len(data["insights"]) == 7
    assert "average_recovery" in data
