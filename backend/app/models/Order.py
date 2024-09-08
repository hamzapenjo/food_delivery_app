from sqlalchemy import Column, Float, Integer, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class OrderStatus(enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    delivered = "delivered"
    cancelled = "cancelled"
    approved = "approved"

class PaymentMethod(enum.Enum):
    cash = "cash"
    card = "card"
    online = "online"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('users.id'))
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'))
    driver_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    delivery_time = Column(DateTime, nullable=False)
    total_price = Column(Float)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    approved = Column(Boolean, default=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.cash)

    latitude = Column(Float, nullable=True) 
    longitude = Column(Float, nullable=True)

    customer = relationship("User", foreign_keys=[customer_id], back_populates="orders")
    driver = relationship("User", foreign_keys=[driver_id], back_populates="deliveries")
    restaurant = relationship("Restaurant", back_populates="orders")

    order_items = relationship("OrderItem", back_populates="order")
