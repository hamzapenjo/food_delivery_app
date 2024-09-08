import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sidebar,
  Button,
  Label,
  Select,
  Navbar,
  Dropdown,
  Avatar,
  Badge,
} from "flowbite-react";
import { useParams, useNavigate } from "react-router-dom";
import { IoFastFood } from "react-icons/io5";
import { BiDollarCircle } from "react-icons/bi";
import { HiUsers } from "react-icons/hi";
import { BiFoodMenu } from "react-icons/bi";
import { BsBell } from "react-icons/bs";
import logo from "../assets/images/logo.png";
import { jwtDecode } from "jwt-decode";

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("sent");
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

    fetchInvoiceDetails(); 
    fetchNotifications();
  }, []);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/invoices/${id}`);
      const invoice = response.data;
      setStatus(invoice.status || "sent"); 
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/notifications/${user.sub}`);
      const unreadNotifications = response.data.filter(notification => !notification.is_read);
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length); 
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://127.0.0.1:8000/notifications/${notificationId}/mark-as-read`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/invoices/${id}`, {
        id: parseInt(id),
        status,
      });
      setSuccessMessage("Invoice status updated successfully!");
      setTimeout(() => {
        navigate("/invoices"); 
      }, 2000);
    } catch (error) {
      console.error("Error updating invoice status:", error);
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
            Restaurant Admin Dashboard - Edit Invoice Status
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
              <Sidebar.Item href="/delivery-admin" icon={IoFastFood}>
                Orders
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>

        {/* Main content */}
        <div className="p-8 flex-grow login-signup-container">
          <div className="login-form-container">
            <div className="edit-invoice-status-card">
              <h2 className="mb-6 block">Edit Invoice Status</h2>
              <form className="flex flex-col gap-0">
                <div className="mb-4 block">
                  <Label htmlFor="status" value="Invoice Status" />
                  <Select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="overdue">Overdue</option>
                  </Select>
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
              </form>
            </div>
          </div>
          <div className="login-image-container">
            <img src={logo} alt="Logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
