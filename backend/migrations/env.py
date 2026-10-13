from alembic import context
from sqlalchemy import create_engine

from leadflow.core.config import get_settings
from leadflow.core.database import Base
from leadflow.features.discussions.models import Discussion  # noqa: F401
from leadflow.features.leads.models import Lead  # noqa: F401
from leadflow.features.search.models import IndexEvent  # noqa: F401

if context.is_offline_mode():
    context.configure(
        url=get_settings().database_url,
        target_metadata=Base.metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()
else:
    engine = create_engine(get_settings().database_url)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()
