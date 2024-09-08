from sqlalchemy import Column, Integer, String, Float, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class GroupMenuItem(Base):
    __tablename__ = "group_menu_items"

    group_menu_id = Column(Integer, ForeignKey("group_menus.id"), primary_key=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), primary_key=True)

    group_menu = relationship("GroupMenu", back_populates="group_menu_items")
    menu_item = relationship("MenuItem", back_populates="group_menu_items")