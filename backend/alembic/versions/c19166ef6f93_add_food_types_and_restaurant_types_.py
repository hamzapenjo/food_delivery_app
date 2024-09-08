"""Add food_types and restaurant_types tables

Revision ID: c19166ef6f93
Revises: ad2ff45e548e
Create Date: 2024-08-20 15:10:47.140621

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c19166ef6f93'
down_revision: Union[str, None] = 'ad2ff45e548e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        'food_types',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False)
    )

    op.create_table(
        'restaurant_types',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False)
    )

    op.add_column('restaurants', sa.Column('food_type_id', sa.Integer, sa.ForeignKey('food_types.id')))
    op.add_column('restaurants', sa.Column('restaurant_type_id', sa.Integer, sa.ForeignKey('restaurant_types.id')))


def downgrade():
    op.drop_column('restaurants', 'food_type_id')
    op.drop_column('restaurants', 'restaurant_type_id')

    op.drop_table('restaurant_types')

    op.drop_table('food_types')