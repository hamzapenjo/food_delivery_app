from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLAEnum
from sqlalchemy.orm import relationship
from app.database import Base
from app.enums import DriverStatus

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phone_number = Column(String, nullable=False)
    status = Column(String, default='active')
    vehicle_type = Column(String)
    license_plate = Column(String)
    status = Column(SQLAEnum(DriverStatus), default=DriverStatus.available)

    user = relationship("User", back_populates="driver")

    invoices = relationship("Invoice", back_populates="driver")