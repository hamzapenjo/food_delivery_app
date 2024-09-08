from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class RestaurantTypeModel(Base):
    __tablename__ = "restaurant_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)

    restaurants = relationship("Restaurant", back_populates="restaurant_type")
