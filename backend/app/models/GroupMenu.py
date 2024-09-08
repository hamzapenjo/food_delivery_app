from sqlalchemy import Column, Integer, String, Float, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class GroupMenu(Base):
    __tablename__ = "group_menus"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'))
    image_url = Column(String, nullable=True)

    restaurant = relationship("Restaurant", back_populates="group_menus")
    group_menu_items = relationship("GroupMenuItem", back_populates="group_menu")
    menu_items = relationship(
        "MenuItem",
        secondary="group_menu_items",
        back_populates="group_menus"
    )
