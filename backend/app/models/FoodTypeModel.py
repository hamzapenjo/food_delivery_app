from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship

class FoodTypeModel(Base):
    __tablename__ = "food_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    restaurants = relationship("Restaurant", back_populates="food_type")