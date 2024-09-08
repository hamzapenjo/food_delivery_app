import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Sidebar,
  Navbar,
  Dropdown,
  Avatar,
  Card,
  Modal,
  Button,
  Tabs,
} from "flowbite-react";
import { IoBusiness, IoFastFood } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { FaMapLocationDot  } from "react-icons/fa6";
import { FaHamburger  } from "react-icons/fa";
import { MdHistory } from "react-icons/md";
import { RiDiscountPercentFill } from "react-icons/ri";

const RestaurantDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [restaurant, setRestaurant] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [groupMenus, setGroupMenus] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [promotionalItems, setPromotionalItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }

    fetchRestaurantDetails();
    fetchMenuItems();
    fetchGroupMenus();
    fetchPopularItems();
    fetchPromotionalItems();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/restaurants/${id}`
      );
      setRestaurant(response.data);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/menu-items/${id}`
      );
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchGroupMenus = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/group-menus/restaurant/${id}`
      );
      setGroupMenus(response.data);
    } catch (error) {
      console.error("Error fetching group menus:", error);
    }
  };

  const fetchPopularItems = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/menu-items/popular/${id}`
      );
      setPopularItems(response.data);
    } catch (error) {
      console.error("Error fetching popular items:", error);
    }
  };

  const fetchPromotionalItems = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/menu-items/promotional/${id}`
      );
      console.log("Promotional items data:", response.data);
      setPromotionalItems(response.data);
    } catch (error) {
      console.error("Error fetching promotional items:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({});
    navigate("/");
  };

  const handleOrderClick = (item) => {
    setSelectedMenuItem(item);
    setShowModal(true);
  };

  const handleGroupMenuOrderClick = (groupMenu) => {
    setSelectedMenuItem(groupMenu);
    setShowModal(true);
  };

  const handleOrder = async () => {
    try {
      const customerResponse = await axios.get(
        `http://127.0.0.1:8000/customers/${user.sub}`
      );
      const customerId = customerResponse.data.id;

      const itemPrice = selectedMenuItem.promotion_price
        ? selectedMenuItem.promotion_price
        : selectedMenuItem.price;

      const totalPrice = itemPrice * quantity;
      const orderDeliveryTime = deliveryTime || new Date().toISOString();

      const orderData = {
        customer_id: customerId,
        restaurant_id: id,
        total_price: totalPrice,
        items: selectedMenuItem.menu_items
          ? selectedMenuItem.menu_items.map((item) => ({
              menu_item_id: item.id,
              quantity: 1,
            }))
          : [{ menu_item_id: selectedMenuItem.id, quantity: quantity }],
        delivery_time: orderDeliveryTime,
        payment_method: paymentMethod,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/orders/",
        orderData
      );
      console.log("Narudžba uspješno poslana:", response.data);
      setShowModal(false);
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Greška prilikom slanja narudžbe:", error.response.data);
      } else {
        console.error("Greška prilikom slanja narudžbe:", error.message);
      }
    }
  };

  return (
    <div>
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/customer-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Restaurant Details - {restaurant.name}
          </span>
        </Navbar.Brand>
        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="relative mr-4">
                <Avatar
                  alt="User settings"
                  img={`http://localhost:8000${user.profile_image}`}
                  rounded
                />
              </div>
            }
          >
            <Dropdown.Item onClick={() => navigate("/profile")}>
              Go to Profile
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
          </Dropdown>
        </div>
      </Navbar>

      <div className="flex">
        <Sidebar aria-label="Default sidebar example" className="h-screen">
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item href="/customer-dashboard" icon={IoBusiness}>
                Restaurants
              </Sidebar.Item>
              <Sidebar.Item href="/set-location" icon={FaMapLocationDot}>
                Set Location
              </Sidebar.Item>
              <Sidebar.Item href="/order-history" icon={MdHistory}>
                Order History
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>

        <div className="p-2 flex-grow">
          <Tabs aria-label="Menu and Group Menus Tabs">
            <Tabs.Item title="Menu Items" icon={FaHamburger}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {menuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="w-30 h-65 p-2 flex flex-col justify-between"
                  >
                    <img
                      src={`http://localhost:8000${
                        item.image_url || "/uploads/menu_items/placeholder.png"
                      }`}
                      alt={item.name}
                      className="h-20 w-full object-cover mb-2"
                    />
                    <div className="flex-grow">
                      <h5 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        {item.name}
                      </h5>
                      <p className="text-xs text-gray-700 dark:text-gray-400">
                        {item.description}
                      </p>
                      <p className="text-xs font-semibold mt-1">
                        ${item.price}
                      </p>
                      {item.promotion_price && (
                        <p className="text-red-600 font-bold text-xs">
                          On Promotion: ${item.promotion_price}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleOrderClick(item)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mt-2"
                    >
                      Order
                    </button>
                  </Card>
                ))}
              </div>
            </Tabs.Item>
            <Tabs.Item title="Group Menus" icon={IoFastFood}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {groupMenus.map((groupMenu) => (
                  <Card
                    key={groupMenu.id}
                    className="w-30 h-65 p-2 flex flex-col justify-between"
                  >
                    <img
                      src={`http://localhost:8000${
                        groupMenu.image_url ||
                        "/uploads/menu_items/placeholder.png"
                      }`}
                      alt={groupMenu.name}
                      className="h-20 w-full object-cover mb-2"
                    />
                    <div className="flex-grow">
                      <h5 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        {groupMenu.name}
                      </h5>
                      <p className="text-xs text-gray-700 dark:text-gray-400">
                        {groupMenu.description}
                      </p>
                      <p className="text-xs font-semibold mt-1">
                        ${groupMenu.price}
                      </p>

                      <h6 className="mt-2 mb-1 font-semibold text-gray-900 dark:text-white text-xs">
                        Menu Items:
                      </h6>
                      <ul className="text-xs text-gray-700 dark:text-gray-400 mb-2">
                        {groupMenu.menu_items.map((item) => (
                          <li key={item.id}>
                            {item.name} (${item.price})
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => handleGroupMenuOrderClick(groupMenu)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mt-2"
                    >
                      Order
                    </button>
                  </Card>
                ))}
              </div>
            </Tabs.Item>
            <Tabs.Item title="Popular Items" icon={IoFastFood}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularItems.map((item) => (
                  <Card
                    key={item.id}
                    className="w-30 h-65 p-2 flex flex-col justify-between"
                  >
                    <img
                      src={`http://localhost:8000${
                        item.image_url || "/uploads/menu_items/placeholder.png"
                      }`}
                      alt={item.name}
                      className="h-20 w-full object-cover mb-2"
                    />
                    <div className="flex-grow">
                      <h5 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        {item.name}
                      </h5>
                      <p className="text-xs text-gray-700 dark:text-gray-400">
                        {item.description}
                      </p>
                      <p className="text-xs font-semibold mt-1">
                        ${item.price}
                      </p>
                      {item.promotion_price && (
                        <p className="text-red-600 font-bold text-xs">
                          On Promotion: ${item.promotion_price}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleOrderClick(item)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mt-2"
                    >
                      Order
                    </button>
                  </Card>
                ))}
              </div>
            </Tabs.Item>
            <Tabs.Item title="On Promotion" icon={RiDiscountPercentFill}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {promotionalItems.map((item) => (
                  <Card
                    key={item.id}
                    className="w-30 h-65 p-2 flex flex-col justify-between"
                  >
                    <img
                      src={`http://127.0.0.1:8000${
                        item.image_url || "/uploads/menu_items/placeholder.png"
                      }`}
                      alt={item.name}
                      className="h-20 w-full object-cover mb-2"
                    />
                    <div className="flex-grow">
                      <h5 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                        {item.name}
                      </h5>
                      <p className="text-xs text-gray-700 dark:text-gray-400">
                        {item.description}
                      </p>
                      <p className="text-xs font-semibold mt-1">
                        ${item.price}
                      </p>
                      {item.promotion_price && (
                        <p className="text-red-600 font-bold text-xs">
                          On Promotion: ${item.promotion_price}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleOrderClick(item)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mt-2"
                    >
                      Order
                    </button>
                  </Card>
                ))}
              </div>
            </Tabs.Item>
          </Tabs>
        </div>
      </div>

      {showModal && (
        <Modal show={showModal} onClose={() => setShowModal(false)} size="sm">
          <Modal.Header>Order {selectedMenuItem?.name}</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Please enter the quantity:
              </p>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
                Payment Method:
              </p>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 mt-4">
                Desired delivery time (optional):
              </p>
              <input
                type="datetime-local"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-full flex justify-center space-x-4">
              <Button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleOrder}
              >
                Place Order
              </Button>
              <Button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default RestaurantDetails;
