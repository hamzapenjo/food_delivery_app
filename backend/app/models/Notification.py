from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    restaurant_admin_id = Column(Integer, ForeignKey("users.id"))
    restaurant_admin_name = Column(String, nullable=False)

    restaurant_admin = relationship("User", back_populates="notifications")
