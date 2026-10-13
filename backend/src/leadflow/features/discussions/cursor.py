import base64
from datetime import datetime
from uuid import UUID

from leadflow.core.errors import AppError


def encode_cursor(created_at: datetime, discussion_id: UUID) -> str:
    return base64.urlsafe_b64encode(f"{created_at.isoformat()}|{discussion_id}".encode()).decode()


def decode_cursor(value: str) -> tuple[datetime, UUID]:
    try:
        timestamp, identifier = (
            base64.b64decode(value, altchars=b"-_", validate=True).decode().split("|")
        )
        parsed = datetime.fromisoformat(timestamp)
        if parsed.tzinfo is None:
            raise ValueError("Missing timezone")
        return parsed, UUID(identifier)
    except (ValueError, UnicodeError) as exc:
        raise AppError(422, "invalid_cursor", "Invalid timeline cursor") from exc
