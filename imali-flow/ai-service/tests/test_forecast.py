from app.forecast import runway


def test_days_left():
    r = runway(300, [100, 100, 100], [{"date": "2026-09-01", "amount": 500}, {"date": "2026-09-15", "amount": 500}])
    assert r["days_left"] == 3.0
