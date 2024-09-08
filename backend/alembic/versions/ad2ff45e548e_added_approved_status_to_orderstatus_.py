"""Added approved status to OrderStatus ENUM

Revision ID: ad2ff45e548e
Revises: e34c89719f48
Create Date: 2024-08-19 01:40:13.822105

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'ad2ff45e548e'
down_revision: Union[str, None] = 'e34c89719f48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE orderstatus ADD VALUE 'approved';")


def downgrade() -> None:
    if not op.get_bind().dialect.has_table(op.get_bind(), "menu_items"):
        op.create_table('menu_items',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('menu_items_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('description', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('price', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
        sa.Column('restaurant_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['restaurant_id'], ['restaurants.id'], name='menu_items_restaurant_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='menu_items_pkey'),
        postgresql_ignore_search_path=False
        )
        op.create_index('ix_menu_items_name', 'menu_items', ['name'], unique=False)
        op.create_index('ix_menu_items_id', 'menu_items', ['id'], unique=False)

    if not op.get_bind().dialect.has_table(op.get_bind(), "restaurants"):
        op.create_table('restaurants',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('restaurants_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('address', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('city', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('stars', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
        sa.Column('category', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('admin_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id'], name='restaurants_admin_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='restaurants_pkey'),
        postgresql_ignore_search_path=False
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), "orders"):
        op.create_table('orders',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('orders_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('customer_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('restaurant_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('driver_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('status', postgresql.ENUM('pending', 'in_progress', 'delivered', 'cancelled', name='orderstatus'), autoincrement=False, nullable=True),
        sa.Column('total_price', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
        sa.Column('updated_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], name='orders_customer_id_fkey'),
        sa.ForeignKeyConstraint(['driver_id'], ['users.id'], name='orders_driver_id_fkey'),
        sa.ForeignKeyConstraint(['restaurant_id'], ['restaurants.id'], name='orders_restaurant_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='orders_pkey'),
        postgresql_ignore_search_path=False
        )
        op.create_index('ix_orders_id', 'orders', ['id'], unique=False)

    if not op.get_bind().dialect.has_table(op.get_bind(), "users"):
        op.create_table('users',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('users_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('hashed_password', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('role', postgresql.ENUM('admin', 'restaurant_admin', 'customer', 'delivery_driver', name='userrole'), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint('id', name='users_pkey'),
        postgresql_ignore_search_path=False
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), "order_items"):
        op.create_table('order_items',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('menu_item_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('quantity', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id'], name='order_items_menu_item_id_fkey'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], name='order_items_order_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='order_items_pkey')
        )
        op.create_index('ix_order_items_id', 'order_items', ['id'], unique=False)
