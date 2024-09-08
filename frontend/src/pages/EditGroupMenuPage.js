import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sidebar,
  Button,
  Label,
  TextInput,
  Navbar,
  Select,
  Checkbox,
  Dropdown,
  Avatar,
  FileInput,
  Badge,
} from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import { BiFoodMenu } from "react-icons/bi";
import { HiUsers } from "react-icons/hi";
import { BiDollarCircle } from "react-icons/bi";
import logo from "../assets/images/logo.png";
import { jwtDecode } from "jwt-decode";
import { BsBell } from "react-icons/bs";

const EditGroupMenuPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [menuItemIds, setMenuItemIds] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); 
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

    fetchGroupMenu();
    fetchRestaurants();
    fetchMenuItems();
    fetchNotifications();
  }, []);

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

  const fetchGroupMenu = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/group-menus/${id}`
      );
      const groupMenu = response.data;
      setName(groupMenu.name);
      setDescription(groupMenu.description);
      setPrice(groupMenu.price);
      setMenuItemIds(groupMenu.menu_items.map((item) => item.id));
      setRestaurantId(groupMenu.restaurant_id);
      setImageUrl(groupMenu.image_url || "");
    } catch (error) {
      console.error("Error fetching group menu:", error);
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

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/menu-items/");
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const handleImageUpload = async (groupMenuId) => {
    if (!imageFile) {
      console.error("No image file selected.");
      return;
    }

    if (!groupMenuId) {
      console.error("Group menu ID is not defined.");
      return;
    }

    console.log("Uploading image for group menu ID:", groupMenuId);

    const formData = new FormData();
    formData.append("group_menu_id", groupMenuId);
    formData.append("file", imageFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload-group-menu-image/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Image uploaded successfully:", response.data);
      setImageUrl(response.data.image_url);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/group-menus/${id}`,
        {
          name,
          description,
          price: parseFloat(price),
          restaurant_id: parseInt(restaurantId),
          menu_item_ids: menuItemIds.map((id) => parseInt(id)),
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Saved successfully!");

        if (imageFile) {
          await handleImageUpload(id);
        }
      }
    } catch (error) {
      console.error("Error saving group menu:", error);
    }
  };

  const handleCheckboxChange = (e) => {
    const value = parseInt(e.target.value);
    if (e.target.checked) {
      setMenuItemIds((prevIds) => [...prevIds, value]);
    } else {
      setMenuItemIds((prevIds) => prevIds.filter((id) => id !== value));
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
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href={getDashboardLink()}>
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Restaurant Admin Dashboard - Edit Group Menu
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
        {/* Sidebar */}
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
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
  
        {/* Main content */}
        <div className="p-8 flex-grow login-signup-container">
          <div className="login-form-container">
            <div className="add-menu-item-card">
              <h2 className="mb-6 block">Edit Group Menu</h2>
              <form className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <div className="mb-4 block">
                    <Label htmlFor="name" value="Group Menu Name" />
                    <TextInput
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Group Menu Name"
                      required
                    />
                  </div>
                  <div className="mb-4 block">
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
                  <div className="mb-4 block">
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
                  <div className="mb-4 block">
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
                  <div className="mb-4 block">
                    <Label htmlFor="file-upload-helper-text" value="Upload Image" />
                    <FileInput
                      id="file-upload-helper-text"
                      helperText="SVG, PNG, JPG or GIF (MAX. 800x400px)."
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </div>
                </div>
                  <div className="flex flex-col gap-4">
                  <div className="mb-4 block">
                    <Label value="Select Menu Items" />
                    {menuItems.map((item) => (
                      <div key={item.id} className="mb-2">
                        <Checkbox
                          id={`menu-item-${item.id}`}
                          value={item.id}
                          checked={menuItemIds.includes(item.id)}
                          onChange={handleCheckboxChange}
                        />
                        <Label
                          htmlFor={`menu-item-${item.id}`}
                          value={`${item.name} - $${item.price}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </form>
  
              {successMessage && (
                <div className="flex justify-center mt-4">
                  <p className="success-message">{successMessage}</p>
                </div>
              )}
  
              <div className="form-actions flex justify-between mt-4">
                <Button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};  

export default EditGroupMenuPage;
