"""Add FoodType and RestaurantType

Revision ID: 1b2ec672f40e
Revises: c19166ef6f93
Create Date: 2024-08-20 15:15:24.282441

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '1b2ec672f40e'
down_revision: Union[str, None] = 'c19166ef6f93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('restaurant_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'users', 'restaurants', ['restaurant_id'], ['id'])

def downgrade() -> None:
    op.drop_constraint(None, 'restaurants', type_='foreignkey')
    op.drop_constraint(None, 'restaurants', type_='foreignkey')
    op.drop_column('restaurants', 'restaurant_type_id')
    op.drop_column('restaurants', 'food_type_id')
    op.drop_constraint(None, 'users', type_='foreignkey')
    op.drop_column('users', 'restaurant_id')

