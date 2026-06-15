"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("filename", sa.String(), nullable=False),
        sa.Column("file_type", sa.String(), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("chunk_count", sa.Integer(), nullable=False),
        sa.Column("upload_date", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="indexed"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "query_history",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("query", sa.String(), nullable=False),
        sa.Column("response", sa.Text(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("total_duration", sa.Float(), nullable=True),
        sa.Column("revision_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "agent_runs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("query_history_id", sa.String(), nullable=False),
        sa.Column("agent_name", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("duration_ms", sa.Float(), nullable=True),
        sa.Column("input_summary", sa.Text(), nullable=True),
        sa.Column("output_summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["query_history_id"], ["query_history.id"], ondelete="CASCADE"),
    )

    # Performance indexes
    op.create_index("ix_documents_status", "documents", ["status"])
    op.create_index("ix_query_history_created_at", "query_history", ["created_at"])
    op.create_index("ix_agent_runs_query_history_id", "agent_runs", ["query_history_id"])


def downgrade() -> None:
    op.drop_index("ix_agent_runs_query_history_id", table_name="agent_runs")
    op.drop_index("ix_query_history_created_at", table_name="query_history")
    op.drop_index("ix_documents_status", table_name="documents")
    op.drop_table("agent_runs")
    op.drop_table("query_history")
    op.drop_table("documents")
