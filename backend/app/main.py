from typing import List
import uuid
from app.models import User, Order
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AssignDriverRequest, CustomerOut, InvoiceCreate, InvoiceOut, InvoiceStatusUpdate, MenuItemSchema, UserCreateSignup, UserOutSignup, UserRole
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import engine, get_db, Base
from app.schemas import (
    UserCreate, UserOut, UserUpdate, 
    RestaurantCreate, RestaurantOut, RestaurantUpdate,
    MenuItemCreate, MenuItemOut, MenuItemUpdate,
    OrderCreate, OrderOut, OrderSimpleOut, OrderStatusUpdate, 
    LoginRequest
)
from app.models import Restaurant 
from app.crud import (
    create_invoice, create_user, create_user_singup, delete_invoice, get_all_group_menus, get_invoice, get_invoices, get_user, get_users, update_invoice_status, update_user, delete_user,
    create_restaurant, get_restaurant, get_restaurants, update_restaurant, delete_restaurant,
    create_menu_item, get_menu_items, update_menu_item, delete_menu_item,
    assign_order_driver, get_orders_by_restaurant, approve_order,
    get_orders_by_driver, update_order_status, create_order, get_orders_by_user,
    authenticate_user, get_available_restaurants
)
from app.crud import (
    create_food_type, get_food_types, get_food_type, update_food_type, delete_food_type,
    create_restaurant_type, get_restaurant_types, get_restaurant_type, update_restaurant_type, delete_restaurant_type,
    create_restaurant, update_restaurant
)
from app.schemas import FoodTypeCreate, FoodTypeOut, RestaurantTypeCreate, RestaurantTypeOut, RestaurantCreate, RestaurantUpdate
from app.database import get_db
from app.crud import get_menu_item 
from app.schemas import NotificationOut
from app.schemas import GroupMenuCreate, GroupMenuOut, GroupMenuItem, GroupMenuUpdate
from app.crud import create_group_menu, get_group_menu, get_group_menus, update_group_menu, delete_group_menu
from app.schemas import InvoiceOut, DriverOut
from app.models.InvoiceModel import Invoice
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, Depends
from app.models.Notification import Notification as NotificationModel
from app.crud import create_driver, get_driver, get_drivers, update_driver, delete_driver
from app.schemas import DriverCreate, DriverUpdate, DriverOut
from app.models.Driver import Driver
from sqlalchemy.orm import joinedload
from fastapi import Form
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from app.crud import get_restaurant_name
from app.models import MenuItem
from app.models import GroupMenu

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


Base.metadata.create_all(bind=engine)

SECRET_KEY = "secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    name: str | None = None

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    if isinstance(to_encode.get("role"), UserRole):
        to_encode["role"] = to_encode["role"].value

    if "profile_image" in data:
        to_encode["profile_image"] = data["profile_image"]
    
    if "id" in data:
        to_encode["id"] = data["id"]

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, name=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.name, "role": user.role, "email": user.email, "profile_image": user.profile_image, "id": user.id},  # Dodavanje user id
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login/")
def login_route(login: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, name=login.username, password=login.password)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.name,
            "role": user.role,
            "email": user.email,
            "profile_image": user.profile_image
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "user_id": user.id}

# @app.get("/")
# def read_root():
#     return {"message": "Hello World"}

@app.post("/users/", response_model=UserOut)
def create_user_route(user: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db=db, user=user)
    return db_user

@app.post("/users-signup/", response_model=UserOutSignup)
def create_user_route(user: UserCreateSignup, db: Session = Depends(get_db)):
    db_user = create_user_singup(db=db, user=user)
    return db_user

@app.get("/users/{user_id}", response_model=UserOut)
def read_user_route(user_id: int, db: Session = Depends(get_db)):
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/users/", response_model=list[UserOut])
def read_users_route(db: Session = Depends(get_db)):
    return get_users(db)

@app.put("/users/{user_id}", response_model=UserOut)
def update_user_route(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/users/{user_id}")
def delete_user_route(user_id: int, db: Session = Depends(get_db)):
    success = delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}


@app.get("/restaurants/", response_model=list[RestaurantOut])
def read_restaurants_route(db: Session = Depends(get_db)):
    return get_restaurants(db)

@app.get("/restaurants/{restaurant_id}", response_model=RestaurantOut)
def read_restaurant_route(restaurant_id: int, db: Session = Depends(get_db)):
    db_restaurant = get_restaurant(db, restaurant_id=restaurant_id)
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return db_restaurant

@app.get("/restaurants/", response_model=list[RestaurantOut])
def read_restaurants_route(db: Session = Depends(get_db)):
    return get_restaurants(db)

@app.post("/restaurants/", response_model=RestaurantOut)
def create_restaurant_route(restaurant: RestaurantCreate, db: Session = Depends(get_db)):
    return create_restaurant(db=db, restaurant=restaurant)

@app.put("/restaurants/{restaurant_id}", response_model=RestaurantOut)
def update_restaurant_route(restaurant_id: int, restaurant: RestaurantUpdate, db: Session = Depends(get_db)):
    db_restaurant = update_restaurant(db, restaurant_id=restaurant_id, restaurant=restaurant)
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return db_restaurant

@app.delete("/restaurants/{restaurant_id}")
def delete_restaurant_route(restaurant_id: int, db: Session = Depends(get_db)):
    success = delete_restaurant(db, restaurant_id=restaurant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"detail": "Restaurant deleted successfully"}

@app.get("/restaurants/{restaurant_id}/menu-items", response_model=List[MenuItemOut])
def get_menu_items_route(restaurant_id: int, db: Session = Depends(get_db)):
    return get_menu_items(db=db, restaurant_id=restaurant_id)


UPLOAD_DIR4 = Path("uploads/restaurants")
UPLOAD_DIR4.mkdir(parents=True, exist_ok=True)

@app.post("/upload-restaurant-image/")
async def upload_restaurant_image(restaurant_id: int = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = UPLOAD_DIR4 / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not db_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    db_restaurant.image_url = f"/uploads/restaurants/{file.filename}"
    db.commit()
    db.refresh(db_restaurant)

    return {"image_url": db_restaurant.image_url}


@app.post("/menu-items/", response_model=MenuItemOut)
def create_menu_item_route(menu_item: MenuItemCreate, db: Session = Depends(get_db)):
    return create_menu_item(db=db, menu_item=menu_item)

@app.get("/menu-items/{restaurant_id}", response_model=list[MenuItemOut])
def get_menu_items_route(restaurant_id: int, db: Session = Depends(get_db)):
    return get_menu_items(db=db, restaurant_id=restaurant_id)

@app.get("/menu-itemsi/{item_id}", response_model=MenuItemOut)
def get_menu_item_route(item_id: int, db: Session = Depends(get_db)):
    db_item = get_menu_item(db, item_id=item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return db_item

@app.delete("/menu-items/{item_id}")
def delete_menu_item_route(item_id: int, db: Session = Depends(get_db)):
    success = delete_menu_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"detail": "Menu item deleted successfully"}


@app.post("/orders/{order_id}/assign-driver/")
def assign_driver(order_id: int, request: AssignDriverRequest, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_driver = db.query(Driver).filter(Driver.id == request.driver_id).first()
    if db_driver is None:
        raise HTTPException(status_code=400, detail="Invalid driver ID")

    db_user = db.query(User).filter(User.id == db_driver.user_id, User.role == UserRole.delivery_driver).first()
    if db_user is None:
        raise HTTPException(status_code=400, detail="User is not a delivery driver")

    db_order.driver_id = db_driver.id
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=List[OrderOut])
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).options(
        joinedload(Order.customer),    
        joinedload(Order.restaurant),  
        joinedload(Order.driver)       
    ).all()

    return [
        {
            "id": order.id,
            "customer_name": order.customer.name if order.customer else "No customer",  
            "restaurant_name": order.restaurant.name if order.restaurant else "No restaurant",  
            "driver_name": order.driver.name if order.driver else "No driver", 
            "status": order.status,
            "total_price": order.total_price,
            "delivery_time": order.delivery_time,
            "approved": order.approved,
            "latitude": order.latitude,
            "longitude": order.longitude 
        }
        for order in orders
    ]

@app.put("/orders/{order_id}/approve/")
def approve_order_route(order_id: int, db: Session = Depends(get_db)):
    success = approve_order(db=db, order_id=order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"detail": "Order approved successfully"}

@app.get("/orders/driver/{driver_id}", response_model=list[OrderOut])
def get_orders_by_driver_route(driver_id: int, db: Session = Depends(get_db)):
    return get_orders_by_driver(db=db, driver_id=driver_id)

@app.put("/orders/{order_id}/status/", response_model=OrderOut)
def update_order_status_route(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.status = status_update.status
    db.commit()
    db.refresh(db_order)

    return {
        "id": db_order.id,
        "customer_name": db_order.customer.name if db_order.customer else "No customer",
        "restaurant_name": db_order.restaurant.name if db_order.restaurant else "No restaurant",
        "driver_name": db_order.driver.name if db_order.driver else "No driver",
        "status": db_order.status,
        "total_price": db_order.total_price,
        "delivery_time": db_order.delivery_time
    }

@app.get("/orders/", response_model=list[OrderOut])
def get_all_orders_route(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found")
    return orders


@app.post("/signup/", response_model=UserOut)
def signup_route(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db=db, user=user)

@app.get("/restaurants/available/", response_model=list[RestaurantOut])
def get_available_restaurants_route(db: Session = Depends(get_db)):
    return get_available_restaurants(db)

@app.get("/menu-items/{restaurant_id}", response_model=list[MenuItemOut])
def get_menu_items_by_restaurant_route(restaurant_id: int, db: Session = Depends(get_db)):
    return get_menu_items(db=db, restaurant_id=restaurant_id)

@app.post("/orders/", response_model=OrderOut)
def create_order_route(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = create_order(db=db, order=order)

    db_order = db.query(Order).options(
        joinedload(Order.customer),     
        joinedload(Order.restaurant),  
        joinedload(Order.driver)      
    ).filter(Order.id == db_order.id).first()

    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": db_order.id,
        "customer_name": db_order.customer.name if db_order.customer else "Unknown",
        "restaurant_name": db_order.restaurant.name if db_order.restaurant else "Unknown",
        "driver_name": db_order.driver.name if db_order.driver else "No driver assigned",
        "status": db_order.status,
        "total_price": db_order.total_price,
        "delivery_time": db_order.delivery_time,
        "approved": db_order.approved,
        "payment_method": db_order.payment_method
    }

@app.get("/orders/{user_id}", response_model=list[OrderOut])
def get_orders_by_user_route(user_id: int, db: Session = Depends(get_db)):
    return get_orders_by_user(db=db, user_id=user_id)


@app.post("/food-types/", response_model=FoodTypeOut)
def create_food_type_route(food_type: FoodTypeCreate, db: Session = Depends(get_db)):
    return create_food_type(db, food_type)

@app.get("/food-types/", response_model=list[FoodTypeOut])
def get_food_types_route(db: Session = Depends(get_db)):
    return get_food_types(db)

@app.get("/food-types/{food_type_id}", response_model=FoodTypeOut)
def get_food_type_route(food_type_id: int, db: Session = Depends(get_db)):
    db_food_type = get_food_type(db, food_type_id)
    if not db_food_type:
        raise HTTPException(status_code=404, detail="Food type not found")
    return db_food_type

@app.put("/food-types/{food_type_id}", response_model=FoodTypeOut)
def update_food_type_route(food_type_id: int, food_type: FoodTypeCreate, db: Session = Depends(get_db)):
    db_food_type = update_food_type(db, food_type_id, food_type)
    if not db_food_type:
        raise HTTPException(status_code=404, detail="Food type not found")
    return db_food_type

@app.delete("/food-types/{food_type_id}")
def delete_food_type_route(food_type_id: int, db: Session = Depends(get_db)):
    db_food_type = delete_food_type(db, food_type_id)
    if not db_food_type:
        raise HTTPException(status_code=404, detail="Food type not found")
    return {"detail": "Food type deleted successfully"}

@app.post("/restaurant-types/", response_model=RestaurantTypeOut)
def create_restaurant_type_route(restaurant_type: RestaurantTypeCreate, db: Session = Depends(get_db)):
    return create_restaurant_type(db, restaurant_type)

@app.get("/restaurant-types/", response_model=list[RestaurantTypeOut])
def get_restaurant_types_route(db: Session = Depends(get_db)):
    return get_restaurant_types(db)

@app.get("/restaurant-types/{restaurant_type_id}", response_model=RestaurantTypeOut)
def get_restaurant_type_route(restaurant_type_id: int, db: Session = Depends(get_db)):
    db_restaurant_type = get_restaurant_type(db, restaurant_type_id)
    if not db_restaurant_type:
        raise HTTPException(status_code=404, detail="Restaurant type not found")
    return db_restaurant_type

@app.put("/restaurant-types/{restaurant_type_id}", response_model=RestaurantTypeOut)
def update_restaurant_type_route(restaurant_type_id: int, restaurant_type: RestaurantTypeCreate, db: Session = Depends(get_db)):
    db_restaurant_type = update_restaurant_type(db, restaurant_type_id, restaurant_type)
    if not db_restaurant_type:
        raise HTTPException(status_code=404, detail="Restaurant type not found")
    return db_restaurant_type

@app.delete("/restaurant-types/{restaurant_type_id}")
def delete_restaurant_type_route(restaurant_type_id: int, db: Session = Depends(get_db)):
    db_restaurant_type = delete_restaurant_type(db, restaurant_type_id)
    if not db_restaurant_type:
        raise HTTPException(status_code=404, detail="Restaurant type not found")
    return {"detail": "Restaurant type deleted successfully"}

@app.get("/admin/restaurant-admin-users/", response_model=List[UserOut])
def get_restaurant_admin_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == UserRole.restaurant_admin).all()
    return users

@app.post("/admin/create-restaurant-admin/", response_model=UserOut)
def create_restaurant_admin_route(user: UserCreate, db: Session = Depends(get_db)):
    user.role = UserRole.restaurant_admin
    db_user = create_user(db=db, user=user)
    return db_user

@app.put("/admin/update-restaurant-admin/{user_id}", response_model=UserOut)
def update_restaurant_admin_route(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    user.role = UserRole.restaurant_admin
    db_user = update_user(db=db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.get("/menu-items/", response_model=List[MenuItemOut])
def get_all_menu_items(db: Session = Depends(get_db)):
    return get_menu_items(db=db)

@app.put("/menu-itemsi/{item_id}", response_model=MenuItemOut)
def update_menu_item_route(item_id: int, menu_item: MenuItemUpdate, db: Session = Depends(get_db)):
    db_item = update_menu_item(db=db, item_id=item_id, menu_item=menu_item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return db_item

@app.post("/group-menus/", response_model=GroupMenuOut)
def create_group_menu_route(group_menu: GroupMenuCreate, db: Session = Depends(get_db)):
    return create_group_menu(db=db, group_menu=group_menu)

@app.get("/group-menus/", response_model=list[GroupMenuOut])
def get_all_group_menus_route(db: Session = Depends(get_db)):
    return get_all_group_menus(db=db)

@app.get("/group-menus/{group_menu_id}", response_model=GroupMenuOut)
def get_group_menu_route(group_menu_id: int, db: Session = Depends(get_db)):
    db_group_menu = get_group_menu(db=db, group_menu_id=group_menu_id)
    if not db_group_menu:
        raise HTTPException(status_code=404, detail="Group menu not found")
    return db_group_menu

@app.get("/group-menus/restaurant/{restaurant_id}", response_model=list[GroupMenuOut])
def get_group_menus_route(restaurant_id: int, db: Session = Depends(get_db)):
    return get_group_menus(db=db, restaurant_id=restaurant_id)

@app.put("/group-menus/{group_menu_id}", response_model=GroupMenuOut)
def update_group_menu_route(group_menu_id: int, group_menu: GroupMenuUpdate, db: Session = Depends(get_db)):
    db_group_menu = update_group_menu(db=db, group_menu_id=group_menu_id, group_menu=group_menu)
    if not db_group_menu:
        raise HTTPException(status_code=404, detail="Group menu not found")
    return db_group_menu

@app.delete("/group-menus/{group_menu_id}", response_model=GroupMenuOut)
def delete_group_menu_route(group_menu_id: int, db: Session = Depends(get_db)):
    db_group_menu = delete_group_menu(db=db, group_menu_id=group_menu_id)
    if not db_group_menu:
        raise HTTPException(status_code=404, detail="Group menu not found")
    return db_group_menu


@app.post("/drivers/", response_model=DriverOut)
def create_driver_route(driver: DriverCreate, db: Session = Depends(get_db)):
    return create_driver(db=db, driver=driver)

@app.get("/drivers/{driver_id}")
def get_driver_route(driver_id: int, db: Session = Depends(get_db)):
    db_driver = get_driver(db=db, driver_id=driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return db_driver

@app.get("/drivers/", response_model=List[DriverOut])
def get_drivers(db: Session = Depends(get_db)):
    drivers = db.query(Driver).options(joinedload(Driver.user)).all()
    return [
        {
            "id": driver.id,
            "user_id": driver.user_id,
            "name": driver.user.name if driver.user else None,
            "email": driver.user.email if driver.user else None,
            "phone_number": driver.phone_number,
            "vehicle_type": driver.vehicle_type,
            "license_plate": driver.license_plate,
            "status": driver.status,
        }
        for driver in drivers
    ]

@app.put("/drivers/{driver_id}", response_model=DriverOut)
def update_driver_route(driver_id: int, driver: DriverUpdate, db: Session = Depends(get_db)):
    db_driver = update_driver(db=db, driver_id=driver_id, driver=driver)
    if db_driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return db_driver

@app.delete("/drivers/{driver_id}")
def delete_driver_route(driver_id: int, db: Session = Depends(get_db)):
    success = delete_driver(db=db, driver_id=driver_id)
    if not success:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"detail": "Driver deleted successfully"}

@app.post("/invoices/", response_model=InvoiceCreate)
def create_invoice_route(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    return create_invoice(db=db, invoice=invoice)

@app.get("/invoices/{invoice_id}", response_model=InvoiceOut)
def get_invoice_route(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = get_invoice(db, invoice_id=invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@app.get("/invoices/", response_model=List[InvoiceOut])
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).options(joinedload(Invoice.driver)).all()
    return [
        {
            "id": invoice.id,
            "driver_id": invoice.driver_id,
            "driver": {
                "id": invoice.driver.id,
                "name": invoice.driver.user.name,
                "email": invoice.driver.user.email,
                "user_id": invoice.driver.user.id,
                "phone_number": invoice.driver.phone_number,
                "vehicle_type": invoice.driver.vehicle_type,
                "license_plate": invoice.driver.license_plate,
                "status": invoice.driver.status.value,
            },
            "amount": invoice.amount,
            "issued_date": invoice.issued_date,
            "due_date": invoice.due_date,
            "status": invoice.status,
            "items": [
                {
                    "id": item.id,
                    "invoice_id": item.invoice_id,
                    "description": item.description,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                }
                for item in invoice.items
            ],
        }
        for invoice in invoices
    ]

@app.put("/invoices/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, status_update: InvoiceStatusUpdate, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = status_update.status
    db.commit()
    db.refresh(invoice)
    
    return invoice


@app.delete("/invoices/{invoice_id}", response_model=InvoiceOut)
def delete_invoice_route(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = delete_invoice(db=db, invoice_id=invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload-profile-image/")
async def upload_profile_image(name: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)    

    db_user = db.query(User).filter(User.name == name).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.profile_image = f"/uploads/{file.filename}"
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(
        data={"sub": db_user.name, "role": db_user.role, "email": db_user.email, "profile_image": db_user.profile_image},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"new_token": access_token, "profile_image_url": db_user.profile_image}


from app.schemas import LocationCreate, Location
from app.models.LocationModel import LocationModel

@app.post("/save-location/", response_model=Location)
def save_location(location: LocationCreate, db: Session = Depends(get_db)):
    existing_location = db.query(LocationModel).filter(LocationModel.user_name == location.user_name).first()

    if existing_location:
        existing_location.name = location.name
        existing_location.latitude = location.latitude
        existing_location.longitude = location.longitude
        db.commit()
        db.refresh(existing_location)
        return existing_location
    else:
        db_location = LocationModel(**location.dict())
        db.add(db_location)
        db.commit()
        db.refresh(db_location)
        return db_location

@app.get("/locations/{user_name}", response_model=list[Location])
def get_locations(user_name: str, db: Session = Depends(get_db)):
    locations = db.query(LocationModel).filter(LocationModel.user_name == user_name).all()
    return locations

@app.get("/customers/{sub}", response_model=UserOut)
def get_customer_by_sub(sub: str, db: Session = Depends(get_db)):
    customer = db.query(User).filter(User.name == sub, User.role == UserRole.customer).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.get("/orders/{sub}/simple", response_model=List[OrderSimpleOut])
def get_all_orders_for_customer_simple(sub: str, db: Session = Depends(get_db)):
    customer = db.query(User).filter(User.name == sub).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    orders = db.query(Order).filter(Order.customer_id == customer.id).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found")
    
    orders_simple = []
    for order in orders:
        orders_simple.append({
            "id": order.id,
            "restaurant_name": order.restaurant.name if order.restaurant else "Unknown Restaurant",
            "status": order.status,
            "total_price": order.total_price,
            "delivery_time": order.delivery_time
        })
    
    return orders_simple

@app.get("/restaurant-name/{restaurant_id}")
async def get_name_route(restaurant_id: int, db: Session = Depends(get_db)):
    name = get_restaurant_name(db, restaurant_id)
    if not name:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"name": name}

UPLOAD_DIR2 = Path("uploads/menu_items")
UPLOAD_DIR2.mkdir(parents=True, exist_ok=True)

@app.post("/upload-menu-item-image/")
async def upload_menu_item_image(item_id: int = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = UPLOAD_DIR2 / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db_item.image_url = f"/uploads/menu_items/{file.filename}"
    db.commit()
    db.refresh(db_item)

    return {"image_url": db_item.image_url}

UPLOAD_DIR3 = Path("uploads/group_menus")
UPLOAD_DIR3.mkdir(parents=True, exist_ok=True)

@app.post("/upload-group-menu-image/")
async def upload_group_menu_image(group_menu_id: int = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = UPLOAD_DIR3 / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    db_group_menu = db.query(GroupMenu).filter(GroupMenu.id == group_menu_id).first()
    if not db_group_menu:
        raise HTTPException(status_code=404, detail="Group menu not found")

    db_group_menu.image_url = f"/uploads/group_menus/{file.filename}"
    db.commit()
    db.refresh(db_group_menu)

    return {"image_url": db_group_menu.image_url}

from app.models import MenuItem, OrderItem
from sqlalchemy import func

@app.get("/menu-items/popular/{restaurant_id}", response_model=List[MenuItemOut])
def get_popular_menu_items(restaurant_id: int, db: Session = Depends(get_db)):
    popular_items = (
        db.query(
            MenuItem.id,
            MenuItem.name,
            MenuItem.description,
            MenuItem.price,
            MenuItem.restaurant_id,
            MenuItem.image_url,
            MenuItem.promotion_price,
        )
        .join(OrderItem, MenuItem.id == OrderItem.menu_item_id)
        .filter(MenuItem.restaurant_id == restaurant_id)
        .group_by(MenuItem.id)
        .order_by(func.count(OrderItem.menu_item_id).desc())
        .limit(3)
        .all()
    )

    return [
        MenuItemOut(
            id=item.id,
            name=item.name,
            description=item.description,
            price=item.price,
            restaurant_id=item.restaurant_id,
            image_url=item.image_url,
            promotion_price=item.promotion_price,
        )
        for item in popular_items
    ]

@app.get("/menu-items/promotional/{restaurant_id}", response_model=List[MenuItemSchema])
def get_promotional_items(restaurant_id: int, db: Session = Depends(get_db)):
    promotional_items = db.query(MenuItem).filter(
        MenuItem.restaurant_id == restaurant_id,
        MenuItem.promotion_price != None
    ).all()
    return promotional_items

@app.get("/notifications/{restaurant_admin_name}", response_model=List[NotificationOut])
def get_notifications(restaurant_admin_name: str, db: Session = Depends(get_db)):
    notifications = db.query(NotificationModel).filter(NotificationModel.restaurant_admin_name == restaurant_admin_name).all()
    return notifications

@app.put("/notifications/{notification_id}/mark-as-read", status_code=204)
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(NotificationModel).filter(NotificationModel.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

from fastapi import WebSocket, WebSocketDisconnect, Depends, Query
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: int, role: str):
        await websocket.accept()
        self.active_connections.append((websocket, user_id, role))

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [
            (ws, uid, role) for (ws, uid, role) in self.active_connections if ws != websocket
        ]

    async def send_personal_message(self, message: str, recipient_id: int):
        for connection, uid, role in self.active_connections:
            if uid == recipient_id:
                await connection.send_text(message)

    async def broadcast(self, message: str):
        for connection, user_id, role in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

from jose import jwt, JWTError

@app.websocket("/ws/{user_id}/{role}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, role: str, token: str = Query(None)):
    try:
        print(f"Received token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_name = payload.get("sub")
        user_role = payload.get("role")
        user_id_from_token = payload.get("id")

        if not user_name or not user_role or not user_id_from_token:
            raise JWTError("Invalid token")

        print(f"Decoded token payload: {payload}")
        
        await websocket.accept()
        await manager.connect(websocket, user_id, role)

        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Received: {data}")
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {user_id} disconnected")
    except JWTError as e:
        print(f"JWT Error: {e}")
        await websocket.close(code=403)
