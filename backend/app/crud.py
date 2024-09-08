from typing import Optional
from sqlalchemy.orm import Session
from app.models import User, Restaurant, MenuItem, Order
from app.models.Order import Order, OrderStatus
from app.schemas import (
    DriverCreate, DriverUpdate, InvoiceCreate, UserCreate, UserUpdate, 
    RestaurantCreate, RestaurantUpdate,
    MenuItemCreate, MenuItemUpdate, OrderCreate
)
from fastapi import HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import joinedload
from app.models import FoodTypeModel
from app.models import RestaurantTypeModel
from app.schemas import FoodTypeCreate, RestaurantTypeCreate
from app.schemas import RestaurantOut
from app.models import GroupMenu, GroupMenuItem
from app.schemas import GroupMenuCreate, GroupMenuUpdate
from app.models.Driver import Driver
from app.models.InvoiceModel import Invoice
from app.models import InvoiceItem
from app.models import OrderItem
from app.email_utils import send_order_confirmation_email
from app.models.Notification import Notification as NotificationModel


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from app.schemas import UserRole, DriverCreate

def create_user(db: Session, user: UserCreate):
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=user.hashed_password,
        role=user.role,
        restaurant_id=user.restaurant_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_singup(db: Session, user: UserCreate):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=user.hashed_password,
        role="customer",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(User).options(joinedload(User.managed_restaurant)).filter(User.id == user_id).first()

def get_users(db: Session):
    return db.query(User).all()

def update_user(db: Session, user_id: int, user: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        return None

    if user.name is not None:
        db_user.name = user.name

    if user.email is not None:
        db_user.email = user.email

    if user.role is not None:
        db_user.role = user.role 

    if user.restaurant_id is not None:
        db_user.restaurant_id = user.restaurant_id 
        
    if user.profile_image is not None:
        db_user.profile_image = user.profile_image 

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        return False
    db.delete(db_user)
    db.commit()
    return True


def create_restaurant(db: Session, restaurant: RestaurantCreate):
    db_restaurant = Restaurant(
        name=restaurant.name, 
        address=restaurant.address, 
        city=restaurant.city,
        stars=restaurant.stars, 
        category=restaurant.category, 
        food_type_id=restaurant.food_type_id,
        restaurant_type_id=restaurant.restaurant_type_id,
        delivery_radius_km=restaurant.delivery_radius_km,
        latitude=restaurant.latitude,
        longitude=restaurant.longitude,
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

def get_restaurant(db: Session, restaurant_id: int):
    restaurant = db.query(Restaurant).options(
        joinedload(Restaurant.food_type),
        joinedload(Restaurant.restaurant_type)
    ).filter(Restaurant.id == restaurant_id).first()

    if restaurant is None:
        return None

    food_type_id = restaurant.food_type_id
    restaurant_type_id = restaurant.restaurant_type_id

    restaurant_out = RestaurantOut(
        id=restaurant.id,
        name=restaurant.name,
        address=restaurant.address,
        city=restaurant.city,
        stars=restaurant.stars,
        category=restaurant.category,
        image_url=restaurant.image_url,
        food_type_id=food_type_id,
        restaurant_type_id=restaurant_type_id,
        delivery_radius_km=restaurant.delivery_radius_km,
        latitude=restaurant.latitude,
        longitude=restaurant.longitude
    )
    
    return restaurant_out


def get_restaurant_name(db: Session, restaurant_id: int):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant:
        return restaurant.name
    return None

def get_restaurants(db: Session):
    restaurants = db.query(Restaurant).all()
    restaurant_out_list = []
    
    for restaurant in restaurants:
        food_type_name = None
        restaurant_type_name = None
        
        if restaurant.food_type_id:
            food_type = db.query(FoodTypeModel).filter(FoodTypeModel.id == restaurant.food_type_id).first()
            if food_type:
                food_type_name = food_type.name
        
        if restaurant.restaurant_type_id:
            restaurant_type = db.query(RestaurantTypeModel).filter(RestaurantTypeModel.id == restaurant.restaurant_type_id).first()
            if restaurant_type:
                restaurant_type_name = restaurant_type.name
        
        restaurant_out = RestaurantOut(
            id=restaurant.id,
            name=restaurant.name,
            address=restaurant.address,
            city=restaurant.city,
            stars=restaurant.stars,
            category=restaurant.category,
            image_url=restaurant.image_url,
            food_type_name=food_type_name,
            restaurant_type_name=restaurant_type_name,
            delivery_radius_km=restaurant.delivery_radius_km,
            latitude=restaurant.latitude, 
            longitude=restaurant.longitude 
        )
        
        restaurant_out_list.append(restaurant_out)
    
    return restaurant_out_list


def update_restaurant(db: Session, restaurant_id: int, restaurant: RestaurantCreate):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if db_restaurant is None:
        return None
    
    db_restaurant.name = restaurant.name
    db_restaurant.address = restaurant.address
    db_restaurant.city = restaurant.city
    db_restaurant.stars = restaurant.stars
    db_restaurant.category = restaurant.category
    db_restaurant.delivery_radius_km = restaurant.delivery_radius_km
    db_restaurant.latitude = restaurant.latitude  
    db_restaurant.longitude = restaurant.longitude

    if restaurant.food_type_id:
        db_restaurant.food_type_id = restaurant.food_type_id
    
    if restaurant.restaurant_type_id:
        db_restaurant.restaurant_type_id = restaurant.restaurant_type_id

    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

def delete_restaurant(db: Session, restaurant_id: int):
    db_restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if db_restaurant is None:
        return False
    db.delete(db_restaurant)
    db.commit()
    return True

def get_menu_items(db: Session, restaurant_id: Optional[int] = None):
    if restaurant_id:
        return db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return db.query(MenuItem).all()

def get_menu_item(db: Session, item_id: int):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if db_item is None:
        print(f"MenuItem with ID {item_id} not found.")
    else:
        print(f"MenuItem found: {db_item}")
    return db_item

def create_menu_item(db: Session, menu_item: MenuItemCreate):
    db_item = MenuItem(**menu_item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_menu_item(db: Session, item_id: int, menu_item: MenuItemUpdate):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found.")

    if menu_item.restaurant_id and not db.query(Restaurant).filter(Restaurant.id == menu_item.restaurant_id).first():
        raise HTTPException(status_code=400, detail="Restaurant with this ID does not exist.")
    
    for key, value in menu_item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_menu_item(db: Session, item_id: int):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False


def assign_order_driver(db: Session, order_id: int, driver_id: int):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order is None:
        return False
    db_order.driver_id = driver_id
    db.commit()
    return True

def get_orders_by_restaurant(db: Session, restaurant_id: int):
    return db.query(Order).filter(Order.restaurant_id == restaurant_id).all()

def approve_order(db: Session, order_id: int):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order is None:
        return False
    db_order.approved = True 
    db.commit()
    return True

def get_all_orders_with_driver_name(db: Session):
    orders = db.query(Order).all()
    orders_with_driver_info = []
    
    for order in orders:
        order_dict = order.__dict__.copy()
        driver = db.query(User).filter(User.id == order.driver_id).first()
        
        if driver:
            order_dict["driver_name"] = driver.name
        else:
            order_dict["driver_name"] = "No driver assigned"
        
        orders_with_driver_info.append(order_dict)
    
    return orders_with_driver_info

def get_orders_by_driver(db: Session, driver_id: int):
    return db.query(Order).filter(Order.driver_id == driver_id).all()

def update_order_status(db: Session, order_id: int, status: str):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order is None:
        return None
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order


def create_notification(db: Session, restaurant_admin_id: int, message: str):
    restaurant_admin = db.query(User).filter(User.id == restaurant_admin_id).first()
    
    notification = NotificationModel(
        restaurant_admin_id=restaurant_admin_id,
        restaurant_admin_name=restaurant_admin.name,
        message=message,
        is_read=False
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

from app.models.LocationModel import LocationModel

def create_order(db: Session, order: OrderCreate):
    db_order = Order(
        customer_id=order.customer_id,
        restaurant_id=order.restaurant_id,
        delivery_time=order.delivery_time,
        total_price=order.total_price,
        status="pending",
        payment_method=order.payment_method
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    customer = db.query(User).filter(User.id == order.customer_id).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="User not found")

    customer_location = db.query(LocationModel).filter(LocationModel.user_name == customer.name).first()

    if customer_location:
        db_order.latitude = customer_location.latitude
        db_order.longitude = customer_location.longitude
        db.commit()
        db.refresh(db_order)
    
    order_items_details = []
    for item in order.items:
        db_menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        db_order_item = OrderItem(
            order_id=db_order.id,
            menu_item_id=item.menu_item_id,
            quantity=item.quantity
        )
        db.add(db_order_item)
        
        order_items_details.append({
            "name": db_menu_item.name,
            "quantity": item.quantity,
            "price": db_menu_item.price
        })

    db.commit()
    db.refresh(db_order)

    send_order_confirmation_email(customer_email=customer.email, order_details=order_items_details)

    restaurant_admin = db.query(User).filter(User.restaurant_id == db_order.restaurant_id, User.role == "restaurant_admin").first()
    if restaurant_admin:
        create_notification(db, restaurant_admin_id=restaurant_admin.id, message=f"Nova narudžba {db_order.id} je kreirana.")

    return db_order



def approve_order(db: Session, order_id: int):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order is None:
        return False
    db_order.approved = True
    db.commit()

    restaurant_admin = db.query(User).filter(User.id == db_order.restaurant_id).first()
    if restaurant_admin:
        create_notification(db, restaurant_admin_id=restaurant_admin.id, message=f"Naručba {db_order.id} je dostavljena.")

    return True

def get_orders_by_user(db: Session, user_id: int):
    return db.query(Order).filter(Order.customer_id == user_id).all()

def authenticate_user(db: Session, name: str, password: str):
    user = db.query(User).filter(User.name == name).first()
    if not user:
        return None
    if user.hashed_password != password:
        return None
    return user

def get_available_restaurants(db: Session):
    return db.query(Restaurant).all()


def create_food_type(db: Session, food_type: FoodTypeCreate):
    db_food_type = FoodTypeModel(name=food_type.name)
    db.add(db_food_type)
    db.commit()
    db.refresh(db_food_type)
    return db_food_type

def get_food_types(db: Session):
    return db.query(FoodTypeModel).all()

def get_food_type(db: Session, food_type_id: int):
    return db.query(FoodTypeModel).filter(FoodTypeModel.id == food_type_id).first()

def update_food_type(db: Session, food_type_id: int, food_type: FoodTypeCreate):
    db_food_type = db.query(FoodTypeModel).filter(FoodTypeModel.id == food_type_id).first()
    if db_food_type:
        db_food_type.name = food_type.name
        db.commit()
        db.refresh(db_food_type)
    return db_food_type

def delete_food_type(db: Session, food_type_id: int):
    db_food_type = db.query(FoodTypeModel).filter(FoodTypeModel.id == food_type_id).first()
    if db_food_type:
        db.delete(db_food_type)
        db.commit()
    return db_food_type

def create_restaurant_type(db: Session, restaurant_type: RestaurantTypeCreate):
    db_restaurant_type = RestaurantTypeModel(name=restaurant_type.name)
    db.add(db_restaurant_type)
    db.commit()
    db.refresh(db_restaurant_type)
    return db_restaurant_type

def get_restaurant_types(db: Session):
    return db.query(RestaurantTypeModel).all()

def get_restaurant_type(db: Session, restaurant_type_id: int):
    return db.query(RestaurantTypeModel).filter(RestaurantTypeModel.id == restaurant_type_id).first()

def update_restaurant_type(db: Session, restaurant_type_id: int, restaurant_type: RestaurantTypeCreate):
    db_restaurant_type = db.query(RestaurantTypeModel).filter(RestaurantTypeModel.id == restaurant_type_id).first()
    if db_restaurant_type:
        db_restaurant_type.name = restaurant_type.name
        db.commit()
        db.refresh(db_restaurant_type)
    return db_restaurant_type

def delete_restaurant_type(db: Session, restaurant_type_id: int):
    db_restaurant_type = db.query(RestaurantTypeModel).filter(RestaurantTypeModel.id == restaurant_type_id).first()
    if db_restaurant_type:
        db.delete(db_restaurant_type)
        db.commit()
    return db_restaurant_type


def create_group_menu(db: Session, group_menu: GroupMenuCreate):
    db_group_menu = GroupMenu(
        name=group_menu.name,
        description=group_menu.description,
        price=group_menu.price,
        restaurant_id=group_menu.restaurant_id 
    )
    db.add(db_group_menu)
    db.commit()
    db.refresh(db_group_menu)

    for menu_item_id in group_menu.menu_item_ids:
        db_group_menu_item = GroupMenuItem(
            group_menu_id=db_group_menu.id,
            menu_item_id=menu_item_id
        )
        db.add(db_group_menu_item)

    db.commit()
    db.refresh(db_group_menu)

    return db_group_menu

def get_group_menu(db: Session, group_menu_id: int):
    group_menu = db.query(GroupMenu).filter(GroupMenu.id == group_menu_id).first()
    if group_menu:
        group_menu.menu_items = (
            db.query(MenuItem)
            .join(GroupMenuItem, MenuItem.id == GroupMenuItem.menu_item_id)
            .filter(GroupMenuItem.group_menu_id == group_menu_id)
            .all()
        )
    return group_menu

def get_group_menus(db: Session, restaurant_id: int):
    group_menus = db.query(GroupMenu).filter(GroupMenu.restaurant_id == restaurant_id).all()
    for group_menu in group_menus:
        group_menu.menu_items = (
            db.query(MenuItem)
            .join(GroupMenuItem, MenuItem.id == GroupMenuItem.menu_item_id)
            .filter(GroupMenuItem.group_menu_id == group_menu.id)
            .all()
        )
    return group_menus

def update_group_menu(db: Session, group_menu_id: int, group_menu: GroupMenuUpdate):
    db_group_menu = db.query(GroupMenu).filter(GroupMenu.id == group_menu_id).first()
    if db_group_menu:
        for key, value in group_menu.dict(exclude_unset=True).items():
            setattr(db_group_menu, key, value)
        db.commit()
        db.refresh(db_group_menu)
    return db_group_menu

def delete_group_menu(db: Session, group_menu_id: int):
    db_group_menu = db.query(GroupMenu).filter(GroupMenu.id == group_menu_id).first()
    
    if db_group_menu:
        db.query(GroupMenuItem).filter(GroupMenuItem.group_menu_id == group_menu_id).delete()
        db.delete(db_group_menu)
        db.commit()

    return db_group_menu

def get_all_group_menus(db: Session):
    return db.query(GroupMenu).all()


def create_driver(db: Session, driver: DriverCreate):
    new_user = create_user(db=db, user=UserCreate(
        name=driver.name,
        email=driver.email,
        hashed_password=driver.hashed_password,
        role=UserRole.delivery_driver,
        restaurant_id=None 
    ))

    new_driver = Driver(
        user_id=new_user.id,
        phone_number=driver.phone_number,
        license_plate=driver.license_plate,
        vehicle_type = driver.vehicle_type,
        status=driver.status
    )
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)

    return new_driver

def get_driver(db: Session, driver_id: int):
    return db.query(Driver).options(joinedload(Driver.user)).filter(Driver.id == driver_id).first()

def get_drivers(db: Session):
    drivers = db.query(Driver).join(User).all()
    for driver in drivers:
        print(f"Driver ID: {driver.id}, Name: {driver.user.name}, Email: {driver.user.email}")
    return drivers

def update_driver(db: Session, driver_id: int, driver: DriverUpdate):
    db_driver = get_driver(db, driver_id=driver_id)
    if db_driver:
        for key, value in driver.dict(exclude_unset=True).items():
            setattr(db_driver, key, value)
        db.commit()
        db.refresh(db_driver)
    return db_driver

def delete_driver(db: Session, driver_id: int):
    db_driver = get_driver(db, driver_id=driver_id)
    if db_driver:
        db.delete(db_driver)
        db.commit()
        return True
    return False

def create_invoice(db: Session, invoice: InvoiceCreate):
    db_invoice = Invoice(
        driver_id=invoice.driver_id,
        amount=invoice.amount,
        issued_date=invoice.issued_date,
        due_date=invoice.due_date,
        status=invoice.status
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    for item in invoice.items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def get_invoice(db: Session, invoice_id: int):
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()

def get_invoices(db: Session):
    return db.query(Invoice).all()

def update_invoice_status(db: Session, invoice_id: int, status: str):
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not db_invoice:
        return None
    db_invoice.status = status
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int):
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not db_invoice:
        return None
    db.delete(db_invoice)
    db.commit()
    return db_invoice