from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models import User
class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    city = Column(String)
    stars = Column(Float)
    category = Column(String)
    image_url = Column(String)
    delivery_radius_km = Column(Float, default=10.0) 

    latitude = Column(Float) 
    longitude = Column(Float) 
    
    admins = relationship("User", back_populates="managed_restaurant", foreign_keys=[User.restaurant_id])
    menu_items = relationship("MenuItem", back_populates="restaurant")
    orders = relationship("Order", back_populates="restaurant")

    food_type_id = Column(Integer, ForeignKey('food_types.id'))
    restaurant_type_id = Column(Integer, ForeignKey('restaurant_types.id'))

    group_menus = relationship("GroupMenu", back_populates="restaurant")
    food_type = relationship('FoodTypeModel')
    restaurant_type = relationship('RestaurantTypeModel')
    orders = relationship("Order", back_populates="restaurant")
