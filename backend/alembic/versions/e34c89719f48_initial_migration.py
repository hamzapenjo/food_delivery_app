"""Initial migration

Revision ID: e34c89719f48
Revises: 
Create Date: 2024-08-18 23:19:51.608490

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e34c89719f48'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index('ix_restaurants_id', table_name='restaurants')
    op.drop_index('ix_restaurants_name', table_name='restaurants')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_index('ix_users_name', table_name='users')



def downgrade() -> None:
    op.create_table('users',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('users_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('age', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='users_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_index('ix_users_name', 'users', ['name'], unique=False)
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_table('restaurants',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('address', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('city', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('stars', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('category', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('admin_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['admin_id'], ['users.id'], name='restaurants_admin_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='restaurants_pkey')
    )
    op.create_index('ix_restaurants_name', 'restaurants', ['name'], unique=False)
    op.create_index('ix_restaurants_id', 'restaurants', ['id'], unique=False)
