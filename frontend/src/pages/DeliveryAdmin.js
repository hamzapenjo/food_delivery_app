import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sidebar,
  Table,
  Navbar,
  Button,
  Dropdown,
  Avatar,
  Badge,
  Pagination,
} from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import { HiUsers } from "react-icons/hi";
import { BiDollarCircle } from "react-icons/bi";
import { BiFoodMenu } from "react-icons/bi";
import { BsBell } from "react-icons/bs";
import logo from "../assets/images/logo.png";
import { jwtDecode } from "jwt-decode";

const DeliveryAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 5;

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

    fetchOrders();
    fetchDrivers();
    fetchNotifications();
  }, [user.sub]);

  const fetchNotifications = async () => {
    console.log("Fetching notifications for user:", user.sub);
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

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/orders");

      const sortedOrders = [...response.data].sort((a, b) => b.id - a.id);

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/drivers");
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const assignDriver = async (orderId, driverId) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/orders/${orderId}/assign-driver/`,
        { driver_id: driverId }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, driver_id: driverId } : order
        )
      );
    } catch (error) {
      console.error(
        "Error assigning driver:",
        error.response?.data || error.message
      );
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await axios.put(`http://127.0.0.1:8000/orders/${orderId}/approve/`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, approved: true } : order
        )
      );
    } catch (error) {
      console.error("Error approving order:", error);
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

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href={getDashboardLink()}>
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Restaurant Admin Dashboard - Orders
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

        <div className="p-8 flex-grow admin-dashboard-content">
          <div className="admin-dashboard-card mt-16">
            <div className="overflow-x-auto mt-8">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Order ID</Table.HeadCell>
                  <Table.HeadCell>Customer Name</Table.HeadCell>
                  <Table.HeadCell>Restaurant Name</Table.HeadCell>
                  <Table.HeadCell>Driver</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Total Price</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {currentItems.map((order) => (
                    <Table.Row
                      key={order.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {order.id}
                      </Table.Cell>
                      <Table.Cell>{order.customer_name}</Table.Cell>
                      <Table.Cell>{order.restaurant_name}</Table.Cell>
                      <Table.Cell>
                        <select
                          value={order.driver_id || ""}
                          onChange={(e) =>
                            assignDriver(order.id, parseInt(e.target.value))
                          }
                          className="form-select"
                        >
                          <option value="" disabled>
                            Select Driver
                          </option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name || "Unknown Driver"}
                            </option>
                          ))}
                        </select>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            order.status === "delivered" ? "success" : "info"
                          }
                          className="px-2 py-1"
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}{" "}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{order.total_price}</Table.Cell>
                      <Table.Cell>
                        <Button
                          className={`${
                            order.approved
                              ? "bg-green-500"
                              : "bg-blue-500 hover:bg-blue-700"
                          } text-white font-bold py-2 px-4 rounded`}
                          onClick={() => handleApprove(order.id)}
                          disabled={order.approved}
                        >
                          {order.approved ? "Approved" : "Approve"}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(orders.length / itemsPerPage)}
                  onPageChange={onPageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAdmin;
