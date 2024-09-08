import enum
from pydantic import BaseModel
from typing import Optional, List
from app.models import UserRole
from datetime import datetime
from enum import Enum
from app.enums import DriverStatus
from fastapi import UploadFile

class UserCreate(BaseModel):
    name: str
    email: str
    hashed_password: str
    role: Optional[UserRole] = UserRole.restaurant_admin
    restaurant_id: Optional[int] = None

class UserCreateSignup(BaseModel):
    name: str
    email: str
    hashed_password: str
    role: Optional[UserRole] = UserRole.customer

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: Optional[UserRole] = None
    managed_restaurant: Optional["RestaurantOut"] = None  
    profile_image: Optional[str] = None

    class Config:
        orm_mode = True

class UserOutSignup(BaseModel):
    id: int
    name: str
    email: str
    role: Optional[UserRole] = "customer"

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    name: str
    email: str
    role: Optional[UserRole] = UserRole.restaurant_admin
    restaurant_id: Optional[int] = None
    profile_image: Optional[UploadFile] = None
    
    class Config:
        orm_mode = True

class RestaurantCreate(BaseModel):
    name: str
    address: str
    city: str
    stars: float
    category: str
    image_url: Optional[str] = None
    delivery_radius_km: float = 10.0
    latitude: float
    longitude: float
    food_type_id: Optional[int] = None
    restaurant_type_id: Optional[int] = None


class RestaurantOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    stars: float
    category: str    
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    food_type_name: Optional[str] = None
    restaurant_type_name: Optional[str] = None
    delivery_radius_km: float

    class Config:
        orm_mode = True

class RestaurantUpdate(BaseModel):
    name: str
    address: str
    city: str
    stars: float
    category: str
    delivery_radius_km: float
    latitude: float
    longitude: float
    food_type_id: Optional[int] = None
    restaurant_type_id: Optional[int] = None

    class Config:
        orm_mode = True 

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    restaurant_id: int
    image_url: Optional[str] = None 
    promotion_start: Optional[datetime] = None 
    promotion_end: Optional[datetime] = None 
    promotion_price: Optional[float] = None 


class MenuItemOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    restaurant_id: Optional[int] = None
    image_url: Optional[str] = None 
    promotion_start: Optional[datetime] = None   
    promotion_end: Optional[datetime] = None   
    promotion_price: Optional[float] = None   


    class Config:
        orm_mode = True   

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    restaurant_id: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None   
    promotion_start: Optional[datetime] = None   
    promotion_end: Optional[datetime] = None   
    promotion_price: Optional[float] = None   

    class Config:
        from_attributes = True   
   
class OrderStatusUpdate(BaseModel):
    status: str

    class Config:
        orm_mode = True


class AssignDriver(BaseModel):
    driver_id: int

class AssignDriverRequest(BaseModel):
    driver_id: int

class OrderOut(BaseModel):
    id: int
    customer_name: str
    restaurant_name: str
    driver_name: Optional[str]
    status: str
    total_price: float
    delivery_time: Optional[datetime] = None
    approved: Optional[bool] = False  
    latitude: Optional[float] = None  
    longitude: Optional[float] = None
    
    class Config:
        from_attributes = True

class OrderSimpleOut(BaseModel):
    id: int
    restaurant_name: str
    status: str
    total_price: float
    delivery_time: datetime

    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    username: str
    password: str


class FoodTypeCreate(BaseModel):
    name: str

class FoodTypeOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class RestaurantTypeCreate(BaseModel):
    name: str

class RestaurantTypeOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class MenuItemSchema(BaseModel):
    id: int
    name: str
    price: float
    promotion_price: float  
    image_url: str 
    class Config:
        orm_mode = True

class MenuItemOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    restaurant_id: Optional[int] = None
    image_url: Optional[str] = None
    promotion_start: Optional[datetime] = None     
    promotion_end: Optional[datetime] = None    
    promotion_price: Optional[float] = None

    class Config:
        orm_mode = True

class GroupMenuCreate(BaseModel):
    name: str
    description: str
    price: float
    restaurant_id: int
    menu_item_ids: List[int]    
    image_url: Optional[str] = None

class GroupMenuOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    menu_items: List[MenuItemOut]   
    image_url: Optional[str] = None 

    class Config:
        orm_mode = True

class GroupMenuUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    menu_item_ids: Optional[List[int]] = None
    restaurant_id: Optional[int] = None
    image_url: Optional[str] = None
    class Config:
        orm_mode = True

class GroupMenuItem(BaseModel):
    group_menu_id: int
    menu_item_id: int

    class Config:
        from_attributes = True


class DriverBase(BaseModel):
    phone_number: str
    status: Optional[str] = "active"
    vehicle_type: Optional[str]
    license_plate: Optional[str]
    driver_status: Optional[str] = "available"

class DriverCreate(BaseModel):
    name: str
    email: str
    hashed_password: str
    phone_number: str
    license_plate: str
    vehicle_type: str
    status: DriverStatus

    class Config:
        orm_mode = True    

class DriverOut(BaseModel):
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    user_id: int
    phone_number: str
    vehicle_type: str
    license_plate: str
    status: str

    class Config:
        from_attributes = True

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    license_plate: Optional[str] = None
    status: Optional[str] = None

    class Config:
        orm_mode = True

class InvoiceItemCreate(BaseModel):
    description: str
    quantity: int
    unit_price: float

class InvoiceCreate(BaseModel):
    driver_id: int
    amount: float
    issued_date: datetime
    due_date: datetime
    status: str
    items: List[InvoiceItemCreate]

class InvoiceItemOut(BaseModel):
    id: int
    invoice_id: int
    description: str
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    id: int
    driver_id: int
    driver: DriverOut
    amount: float
    issued_date: datetime
    due_date: datetime
    status: str
    items: List[InvoiceItemOut]

    class Config:
        from_attributes = True

class InvoiceStatusUpdate(BaseModel):
    id: int
    status: str

    class Config:
        orm_mode = True

class LocationBase(BaseModel):
    name: str
    latitude: float
    longitude: float

class LocationCreate(LocationBase):
    user_name: str    

class Location(LocationBase):
    id: int

    class Config:
        orm_mode = True

class CustomerOut(BaseModel):
    id: int
    name: str
    email: str
    profile_image: str

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class PaymentMethod(enum.Enum):
    cash = "cash"
    card = "card"
    online = "online"

class OrderCreate(BaseModel):
    customer_id: int
    restaurant_id: int
    total_price: float
    approved: Optional[bool] = False
    delivery_time: Optional[datetime] = None  
    items: Optional[List[OrderItemCreate]] = None 
    payment_method: PaymentMethod = PaymentMethod.cash

    class Config:
        orm_mode = True
        use_enum_values = True


class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: bool
    restaurant_admin_id: int

    class Config:
        from_attributes = True