from sqlalchemy import Column, DateTime, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'))
    image_url = Column(String, nullable=True) 
    promotion_start = Column(DateTime, nullable=True)
    promotion_end = Column(DateTime, nullable=True)  
    promotion_price = Column(Float, nullable=True) 

    restaurant = relationship("Restaurant", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")

    group_menu_items = relationship("GroupMenuItem", back_populates="menu_item")
    group_menus = relationship(
        "GroupMenu",
        secondary="group_menu_items",
        back_populates="menu_items"
    )
