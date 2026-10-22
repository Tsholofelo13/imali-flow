"""Simple, explainable runway forecast. Swap in something smarter later (e.g. statsmodels)."""
from datetime import date, timedelta
from statistics import mean


def runway(balance: float, daily_spend_history: list[float], income_events: list[dict]) -> dict:
    """income_events: [{"date": "2026-10-01", "amount": 450.0}, ...]"""
    avg_spend = mean(daily_spend_history) if daily_spend_history else 0.0
    days_left = None if avg_spend <= 0 else balance / avg_spend

    next_income_in_days = None
    dates = sorted(date.fromisoformat(e["date"]) for e in income_events)
    gaps = [(b - a).days for a, b in zip(dates, dates[1:])]
    if dates and gaps:
        expected = dates[-1] + timedelta(days=mean(gaps))
        next_income_in_days = max(0, (expected - date.today()).days)

    shortfall_risk = "unknown"
    if days_left is not None and next_income_in_days is not None:
        shortfall_risk = "high" if days_left < next_income_in_days else "low"
    return {
        "days_left": None if days_left is None else round(days_left, 1),
        "avg_daily_spend": round(avg_spend, 2),
        "expected_days_to_next_income": next_income_in_days,
        "shortfall_risk": shortfall_risk,
        "note": "Estimate based on your past pattern. Guidance only, not financial advice.",
    }
