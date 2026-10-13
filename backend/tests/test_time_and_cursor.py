from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from leadflow.core.errors import AppError
from leadflow.features.discussions.cursor import decode_cursor, encode_cursor
from leadflow.features.leads import presentation
from leadflow.features.leads.models import Lead, LeadStatus


def test_cursor_round_trip():
    now, identifier = datetime.now(UTC), uuid4()
    assert decode_cursor(encode_cursor(now, identifier)) == (now, identifier)


@pytest.mark.parametrize("cursor", ["!", "", "bm90LWEtdGltZXN0YW1w", "💥"])
def test_invalid_cursors(cursor):
    with pytest.raises(AppError):
        decode_cursor(cursor)


def test_timezone_midnight_and_overdue(monkeypatch):
    now = datetime(2026, 10, 13, 19, tzinfo=UTC)
    monkeypatch.setattr(presentation, "utcnow", lambda: now)
    monkeypatch.setattr(
        presentation,
        "get_settings",
        lambda: type("Settings", (), {"business_timezone": "Asia/Kolkata"})(),
    )
    start, end = presentation.today_bounds()
    assert start == datetime(2026, 10, 13, 18, 30, tzinfo=UTC)
    assert end - start == timedelta(days=1)
    lead = Lead(
        id=uuid4(),
        name="A",
        status=LeadStatus.NEW,
        created_at=now,
        updated_at=now,
        follow_up_at=now - timedelta(minutes=1),
    )
    assert presentation.present_lead(lead).follow_up_state == "overdue"
    lead.follow_up_at = end - timedelta(seconds=1)
    assert presentation.present_lead(lead).follow_up_state == "today"
    lead.follow_up_at = end
    assert presentation.present_lead(lead).follow_up_state == "upcoming"
