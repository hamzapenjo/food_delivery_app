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
  Toast,
  Pagination,
} from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { HiX } from "react-icons/hi";
import { jwtDecode } from "jwt-decode";
import { FaMapMarkedAlt } from "react-icons/fa";

const DeliveryDriverDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState({});
  const [showToast, setShowToast] = useState(false);
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

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/orders");

      const sortedOrders = response.data.sort((a, b) => b.id - a.id);

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleDeliveryStatus = async (orderId, approved) => {
    if (!approved) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      await axios.put(`http://127.0.0.1:8000/orders/${orderId}/status/`, {
        status: "delivered",
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "delivered" } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getBadgeColorForStatus = (status) => {
    if (status === "delivered") return "success";
    if (status === "pending") return "info";
    return "gray";
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
        <Navbar.Brand href="/delivery-driver-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Delivery Driver Dashboard
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
              <Sidebar.Item href="/delivery-driver-dashboard" icon={IoFastFood}>
                Orders
              </Sidebar.Item>
              <Sidebar.Item href="/orders-map" icon={FaMapMarkedAlt}>
                Orders Map
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
                  <Table.HeadCell>Driver Name</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Total Price</Table.HeadCell>
                  <Table.HeadCell>Approved</Table.HeadCell>
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
                        {order.driver_name || "No driver assigned"}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={getBadgeColorForStatus(order.status)}>
                          {order.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{order.total_price} KM</Table.Cell>
                      <Table.Cell>
                        <Badge color={order.approved ? "success" : "failure"}>
                          {order.approved ? "Approved" : "Not Approved"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          className={`${
                            order.status === "delivered"
                              ? "bg-green-500"
                              : "bg-blue-500 hover:bg-blue-700"
                          } text-white font-bold py-2 px-4 rounded`}
                          onClick={() =>
                            handleDeliveryStatus(order.id, order.approved)
                          }
                          disabled={
                            order.status === "delivered" || !order.approved
                          } 
                        >
                          {order.status === "delivered"
                            ? "Delivered"
                            : "Deliver"}
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

      {showToast && (
        <div className="absolute top-5 right-5">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Order is not approved yet!
            </div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}
    </div>
  );
};

export default DeliveryDriverDashboard;
