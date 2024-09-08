from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class UserRole(enum.Enum):
    admin = "admin"
    restaurant_admin = "restaurant_admin"
    customer = "customer"
    delivery_driver = "delivery_driver"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.customer)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=True)
    profile_image = Column(String, nullable=True)
    
    managed_restaurant = relationship("Restaurant", back_populates="admins")
    orders = relationship("Order", foreign_keys="[Order.customer_id]", back_populates="customer")
    deliveries = relationship("Order", foreign_keys="[Order.driver_id]", back_populates="driver")
    driver = relationship("Driver", back_populates="user", uselist=False)
    drivers = relationship("Driver", back_populates="user")
    notifications = relationship("Notification", back_populates="restaurant_admin")
