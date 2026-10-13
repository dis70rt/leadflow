from datetime import UTC, datetime, time, timedelta
from zoneinfo import ZoneInfo

from leadflow.core.config import get_settings
from leadflow.core.database import utcnow
from leadflow.features.leads.models import Lead
from leadflow.features.leads.schemas import FollowUpState, LeadRead


def today_bounds() -> tuple[datetime, datetime]:
    zone = ZoneInfo(get_settings().business_timezone)
    today = utcnow().astimezone(zone).date()
    return (
        datetime.combine(today, time.min, zone).astimezone(UTC),
        datetime.combine(today + timedelta(days=1), time.min, zone).astimezone(UTC),
    )


def present_lead(lead: Lead) -> LeadRead:
    result = LeadRead.model_validate(lead)
    if lead.follow_up_at:
        reminder = (
            lead.follow_up_at.replace(tzinfo=UTC)
            if lead.follow_up_at.tzinfo is None
            else lead.follow_up_at
        )
        start, end = today_bounds()
        if reminder < utcnow():
            result.follow_up_state = FollowUpState.OVERDUE
        elif start <= reminder < end:
            result.follow_up_state = FollowUpState.TODAY
        else:
            result.follow_up_state = FollowUpState.UPCOMING
    return result
