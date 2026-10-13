import re

from leadflow.core.errors import AppError

FIELDS = {"name_txt": 4, "company_txt": 2, "phone_txt": 2, "discussions_txt": 1}


def build_query(value: str) -> str | None:
    tokens = re.findall(r"[^\W_]+", value.lower(), re.UNICODE)
    if len(tokens) > 12 or any(len(token) > 64 for token in tokens):
        raise AppError(422, "search_too_complex", "Use up to 12 words of at most 64 characters")
    groups = []
    for index, token in enumerate(tokens):
        terms = [f'"{token}"^4']
        if index == len(tokens) - 1 and len(token) >= 2:
            terms.append(f"{token}*^2")
        if len(token) >= 4:
            distance = 2 if len(token) >= 7 else 1
            terms.append(f"{token}~{distance}")
        fields = [f"{field}:({' OR '.join(terms)})^{boost}" for field, boost in FIELDS.items()]
        groups.append(f"({' OR '.join(fields)})")
    return " AND ".join(groups) or None
