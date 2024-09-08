from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
class LocationModel(Base):
    __tablename__ = 'locations'

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)