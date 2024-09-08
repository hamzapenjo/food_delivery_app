import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { BiFoodMenu } from "react-icons/bi";
import { BiDollarCircle } from "react-icons/bi";
import { BsBell } from "react-icons/bs"; 
import logo from "../assets/images/logo.png";
import { jwtDecode } from "jwt-decode";

const DriverAdminPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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
  }, [user.sub]);

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

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/drivers/");
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/drivers/${id}`);
      fetchDrivers();
    } catch (error) {
      console.error("Error deleting driver:", error);
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
  const currentItems = drivers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href={getDashboardLink()}>
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Restaurant Admin Dashboard - Drivers
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
        <div className="p-8 flex-grow admin-dashboard-content">
          <div className="admin-dashboard-card mt-16">
            <div className="flex justify-end items-center mb-4">
              <Link to="/add-driver">
                <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Add New Driver
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto mt-8">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Phone Number</Table.HeadCell>
                  <Table.HeadCell>Vehicle Type</Table.HeadCell>
                  <Table.HeadCell>License Plate</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell style={{ visibility: "hidden" }}>
                    Actions
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {currentItems.map((driver) => (
                    <Table.Row
                      key={driver.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {driver.name}
                      </Table.Cell>
                      <Table.Cell>{driver.email}</Table.Cell>
                      <Table.Cell>{driver.phone_number}</Table.Cell>
                      <Table.Cell>{driver.vehicle_type}</Table.Cell>
                      <Table.Cell>{driver.license_plate}</Table.Cell>
                      <Table.Cell>{driver.status}</Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end space-x-2">
                          <Link to={`/edit-driver/${driver.id}`}>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleDelete(driver.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(drivers.length / itemsPerPage)}
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

export default DriverAdminPage;
