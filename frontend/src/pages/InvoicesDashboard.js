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
import { BiDollarCircle } from "react-icons/bi";
import { BiFoodMenu } from "react-icons/bi";
import { BsBell } from "react-icons/bs";
import logo from "../assets/images/logo.png";
import { jwtDecode } from "jwt-decode";

const InvoicesDashboard = () => {
  const [invoices, setInvoices] = useState([]);
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

    fetchInvoices();
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

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/invoices/");
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
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
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href={getDashboardLink()}>
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Restaurant Admin Dashboard - Invoices
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
              <Link to="/add-invoice">
                <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Add New Invoice
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto mt-8">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>ID</Table.HeadCell>
                  <Table.HeadCell>Driver</Table.HeadCell>
                  <Table.HeadCell>Total Amount</Table.HeadCell>
                  <Table.HeadCell>Issued Date</Table.HeadCell>
                  <Table.HeadCell>Due Date</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell style={{ visibility: "hidden" }}>
                    Actions
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {currentItems.map((invoice) => (
                    <Table.Row
                      key={invoice.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {invoice.id}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {invoice.driver.name}
                      </Table.Cell>
                      <Table.Cell>{invoice.amount} KM</Table.Cell>
                      <Table.Cell>
                        {new Date(invoice.issued_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}{" "}
                        {new Date(invoice.issued_date).toLocaleTimeString(
                          "en-GB",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(invoice.due_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}{" "}
                        {new Date(invoice.due_date).toLocaleTimeString(
                          "en-GB",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Table.Cell>
                      <Table.Cell>{invoice.status}</Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end space-x-2">
                          <Link to={`/edit-invoice/${invoice.id}`}>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleDelete(invoice.id)}
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
                  totalPages={Math.ceil(invoices.length / itemsPerPage)}
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

export default InvoicesDashboard;
