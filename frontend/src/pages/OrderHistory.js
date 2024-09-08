import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Navbar, Dropdown, Avatar, Table, Sidebar, Pagination } from "flowbite-react";
import logo from "../assets/images/logo.png";
import { IoBusiness } from "react-icons/io5";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdHistory } from "react-icons/md";

const OrderHistory = () => {
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);

      const fetchOrders = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/orders/${decodedUser.sub}/simple`
          );
          setOrders(response.data); 
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };
      fetchOrders();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({});
    navigate("/");
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString(); 
  };

  const onPageChange = (page) => setCurrentPage(page);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/customer-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Order History
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
        {/* Sidebar */}
        <Sidebar aria-label="Customer Dashboard Sidebar" className="h-screen">
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item href="/customer-dashboard" icon={IoBusiness}>
                Dashboard
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

        {/* Main content */}
        <div className="p-8 flex-grow">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Order ID</Table.HeadCell>
              <Table.HeadCell>Restaurant</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Total Price</Table.HeadCell>
              <Table.HeadCell>Delivery Time</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {currentOrders.map((order) => (
                <Table.Row key={order.id}>
                  <Table.Cell>{order.id}</Table.Cell>
                  <Table.Cell>{order.restaurant_name}</Table.Cell>
                  <Table.Cell>{order.status}</Table.Cell>
                  <Table.Cell>${order.total_price}</Table.Cell>
                  <Table.Cell>{formatDateTime(order.delivery_time)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(orders.length / ordersPerPage)}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
