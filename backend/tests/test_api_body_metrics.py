import pytest
from datetime import datetime
from app.models.metrics import BodyMetric


def test_create_body_metric(client, auth_headers):
    """Test creating a body metric."""
    response = client.post(
        "/api/body-metrics",
        headers=auth_headers,
        json={
            "measured_at": datetime.utcnow().isoformat(),
            "weight_kg": 75.5,
            "body_fat_percentage": 18.5,
            "bmi": 23.5
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert float(data["weight_kg"]) == 75.5


def test_list_body_metrics(client, auth_headers, db_session, test_user):
    """Test listing body metrics."""
    metrics = [
        BodyMetric(user_id=test_user.id, measured_at=datetime.utcnow(), weight_kg=75.5, bmi=23.5),
        BodyMetric(user_id=test_user.id, measured_at=datetime.utcnow(), weight_kg=74.8, bmi=23.3),
    ]
    db_session.add_all(metrics)
    db_session.commit()

    response = client.get("/api/body-metrics", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_update_body_metric(client, auth_headers, db_session, test_user):
    """Test updating a body metric."""
    metric = BodyMetric(user_id=test_user.id, measured_at=datetime.utcnow(), weight_kg=75.5, bmi=23.5)
    db_session.add(metric)
    db_session.commit()

    response = client.patch(
        f"/api/body-metrics/{metric.id}",
        headers=auth_headers,
        json={"weight_kg": 76.0}
    )

    assert response.status_code == 200
    data = response.json()
    assert float(data["weight_kg"]) == 76.0


def test_delete_body_metric(client, auth_headers, db_session, test_user):
    """Test deleting a body metric."""
    metric = BodyMetric(user_id=test_user.id, measured_at=datetime.utcnow(), weight_kg=75.5, bmi=23.5)
    db_session.add(metric)
    db_session.commit()
    metric_id = metric.id

    response = client.delete(f"/api/body-metrics/{metric_id}", headers=auth_headers)

    assert response.status_code == 204
