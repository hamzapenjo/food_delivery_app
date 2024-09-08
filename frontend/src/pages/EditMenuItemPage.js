import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sidebar,
  Button,
  Label,
  TextInput,
  Navbar,
  Select,
  Dropdown,
  Avatar,
  FileInput,
  Badge,
} from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { useParams, useNavigate } from "react-router-dom";
import { BiFoodMenu } from "react-icons/bi";
import { HiUsers } from "react-icons/hi";
import { BiDollarCircle } from "react-icons/bi";
import { BsBell } from "react-icons/bs";
import { jwtDecode } from "jwt-decode";

const EditMenuItemPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [promotionStart, setPromotionStart] = useState("");
  const [promotionEnd, setPromotionEnd] = useState("");
  const [promotionPrice, setPromotionPrice] = useState("");
  const [imageFile, setImageFile] = useState(null); 
  const [restaurants, setRestaurants] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]); 
  const [unreadCount, setUnreadCount] = useState(0); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    fetchRestaurants();
    fetchMenuItemDetails();
    fetchNotifications(); 
  }, [id, user.sub]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/notifications/${user.sub}`
      );
      const unreadNotifications = response.data.filter(
        (notification) => !notification.is_read
      );
      setNotifications(unreadNotifications); 
      setUnreadCount(unreadNotifications.length); 
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/notifications/${notificationId}/mark-as-read`
      );
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
      setUnreadCount((prevCount) => prevCount - 1); 
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/restaurants/");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchMenuItemDetails = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/menu-itemsi/${id}`
      );
      const item = response.data;

      setName(item.name || "");
      setDescription(item.description || "");
      setPrice(item.price ? item.price.toString() : "");
      setRestaurantId(item.restaurant_id ? item.restaurant_id.toString() : "");
      setPromotionStart(
        item.promotion_start
          ? new Date(item.promotion_start).toISOString().slice(0, 16)
          : ""
      );
      setPromotionEnd(
        item.promotion_end
          ? new Date(item.promotion_end).toISOString().slice(0, 16)
          : ""
      );
      setPromotionPrice(
        item.promotion_price ? item.promotion_price.toString() : ""
      );
    } catch (error) {
      console.error("Error fetching menu item details:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/menu-itemsi/${id}`, {
        name,
        description,
        price: parseFloat(price),
        restaurant_id: parseInt(restaurantId),
        promotion_start: promotionStart || null,
        promotion_end: promotionEnd || null,
        promotion_price: promotionPrice ? parseFloat(promotionPrice) : null,
      });

      if (imageFile) {
        await handleImageUpload();
      }

      setSuccessMessage("Menu item updated successfully!");
      setTimeout(() => {
        navigate("/restaurant-dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  };

  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append("item_id", id);
    formData.append("file", imageFile);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/upload-menu-item-image/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Image uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const getDashboardLink = () => {
    switch (user.role) {
      case "admin":
        return "/admin-dashboard";
      case "restaurant_admin":
        return "/restaurant-dashboard";
      case "delivery_driver":
        return "/delivery-dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <div>
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href={getDashboardLink()}>
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Restaurant Admin Dashboard - Edit Menu Item
          </span>
        </Navbar.Brand>
        <div className="flex md:order-2">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="relative mr-4">
                <BsBell size={24} className="text-white" />
                {unreadCount > 0 && (
                  <Badge
                    color="red"
                    size="sm"
                    className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            }
          >
            <Dropdown.Header>Notifications</Dropdown.Header>
            {notifications.length === 0 ? (
              <Dropdown.Item>No notifications available</Dropdown.Item>
            ) : (
              notifications.map((notification) => (
                <Dropdown.Item key={notification.id}>
                  {notification.message}
                  <Button
                    size="xs"
                    className="ml-2 bg-red-600 text-white hover:bg-red-800"
                    onClick={() => markAsRead(notification.id)}
                  >
                    READ
                  </Button>
                </Dropdown.Item>
              ))
            )}
          </Dropdown>

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
            <Dropdown.Item
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Logout
            </Dropdown.Item>
          </Dropdown>
        </div>
      </Navbar>

      <div className="flex">
        <Sidebar aria-label="Default sidebar example" className="h-screen">
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item href="/restaurant-dashboard" icon={BiFoodMenu}>
                Menu Items
              </Sidebar.Item>
              <Sidebar.Item href="/group-menus" icon={IoFastFood}>
                Group Menus
              </Sidebar.Item>
              <Sidebar.Item href="/drivers" icon={HiUsers}>
                Drivers
              </Sidebar.Item>
              <Sidebar.Item href="/invoices" icon={BiDollarCircle}>
                Invoices
              </Sidebar.Item>
              <Sidebar.Item href="/delivery-admin" icon={IoFastFood}>
                Orders
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>

        <div className="p-8 flex-grow">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="mb-6 block text-2xl font-semibold">Edit Menu Item</h2>
            <form className="flex flex-col gap-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="mb-4">
                    <Label htmlFor="name" value="Menu Item Name" />
                    <TextInput
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Menu Item Name"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="description" value="Description" />
                    <TextInput
                      id="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="price" value="Price" />
                    <TextInput
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="restaurant" value="Assign to Restaurant" />
                    <Select
                      id="restaurant"
                      value={restaurantId}
                      onChange={(e) => setRestaurantId(e.target.value)}
                      required
                    >
                      <option value="">Select a Restaurant</option>
                      {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex-1" style={{ marginLeft: '20px' }}>
                  <div className="mb-4">
                    <Label htmlFor="promotionStart" value="Promotion Start" />
                    <TextInput
                      id="promotionStart"
                      type="datetime-local"
                      value={promotionStart}
                      onChange={(e) => setPromotionStart(e.target.value)}
                      placeholder="Promotion Start Date"
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="promotionEnd" value="Promotion End" />
                    <TextInput
                      id="promotionEnd"
                      type="datetime-local"
                      value={promotionEnd}
                      onChange={(e) => setPromotionEnd(e.target.value)}
                      placeholder="Promotion End Date"
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="promotionPrice" value="Promotion Price" />
                    <TextInput
                      id="promotionPrice"
                      type="number"
                      value={promotionPrice}
                      onChange={(e) => setPromotionPrice(e.target.value)}
                      placeholder="Promotion Price"
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="file-upload-helper-text" value="Upload Image" />
                    <FileInput
                      id="file-upload-helper-text"
                      helperText="SVG, PNG, JPG or GIF (MAX. 800x400px)."
                      onChange={(e) => setImageFile(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
              {successMessage && (
                <div className="flex justify-center mt-4">
                  <p className="success-message">{successMessage}</p>
                </div>
              )}
              <div className="form-actions flex justify-between mt-4">
                <Button
                  type="button"
                  onClick={handleUpdate}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                >
                  Update
                </Button>
                <Button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold rounded"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMenuItemPage;
