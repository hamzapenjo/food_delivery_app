import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Badge,
} from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import { HiUsers } from "react-icons/hi";
import { BiFoodMenu, BiDollarCircle } from "react-icons/bi";
import { BsBell } from "react-icons/bs";
import logo from "../assets/images/logo.png";
import { jwtDecode } from "jwt-decode";

const AddInvoicePage = () => {
  const [driverId, setDriverId] = useState("");
  const [amount, setAmount] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("sent");
  const [drivers, setDrivers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState({}); 
  const [notifications, setNotifications] = useState([]); 
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

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

    fetchDrivers();
    fetchNotifications();
  }, []);

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

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/drivers/");
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/invoices/", {
        driver_id: parseInt(driverId),
        amount: parseFloat(amount),
        issued_date: issuedDate,
        due_date: dueDate,
        status,
        items: [],
      });

      if (response.status === 200) {
        setSuccessMessage("Invoice added successfully!");
        setDriverId("");
        setAmount("");
        setIssuedDate("");
        setDueDate("");
        setStatus("sent");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
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
            Restaurant Admin Dashboard - Add Invoice
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
            <div className="add-invoice-card">
              <h2 className="mb-6 block">Add New Invoice</h2>
              <form className="flex flex-col gap-4">
                <div className="mb-4 block">
                  <Label htmlFor="driverId" value="Driver" />
                  <Select
                    id="driverId"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    required
                  >
                    <option value="">Select a Driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} - {driver.vehicle_type}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="mb-4 block">
                  <Label htmlFor="amount" value="Amount" />
                  <TextInput
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Invoice Amount"
                    required
                  />
                </div>
                <div className="mb-4 block">
                  <Label htmlFor="issuedDate" value="Issued Date" />
                  <TextInput
                    id="issuedDate"
                    type="datetime-local"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4 block">
                  <Label htmlFor="dueDate" value="Due Date" />
                  <TextInput
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4 block">
                  <Label htmlFor="status" value="Status" />
                  <Select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="pending">Pending</option>
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
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                  >
                    Save
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

export default AddInvoicePage;
