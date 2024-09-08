import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sidebar,
  Table,
  Button,
  Navbar,
  Dropdown,
  Avatar,
  Pagination,
} from "flowbite-react";
import { HiUsers } from "react-icons/hi";
import { IoFastFood, IoRestaurantOutline, IoBusiness } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { jwtDecode } from "jwt-decode";

const RestaurantAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [user, setUser] = useState({});
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

    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/admin/restaurant-admin-users/"
      );
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching restaurant admins:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/users/${id}`);
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = admins.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/admin-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Admin Dashboard - Restaurant Admins
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
        {/* Sidebar */}
        <Sidebar aria-label="Default sidebar example" className="h-screen">
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <Sidebar.Item href="/admin-dashboard" icon={IoBusiness}>
                Restaurants
              </Sidebar.Item>
              <Sidebar.Item href="/food-types" icon={IoFastFood}>
                Food Types
              </Sidebar.Item>
              <Sidebar.Item href="/restaurant-types" icon={IoRestaurantOutline}>
                Restaurant Types
              </Sidebar.Item>
              <Sidebar.Item href="/restaurant-admins" icon={HiUsers}>
                Restaurant Admins
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>

        <div className="p-8 flex-grow admin-dashboard-content">
          <div className="admin-dashboard-card mt-16">
            <div className="flex justify-end items-center mb-4">
              <Link to="/add-restaurant-admin">
                <Button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-auto">
                  Add New Restaurant Admin
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto mt-8">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Restaurant</Table.HeadCell>
                  <Table.HeadCell>
                    <span className="sr-only">Actions</span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {currentItems.map((admin) => (
                    <Table.Row
                      key={admin.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {admin.name}
                      </Table.Cell>
                      <Table.Cell>{admin.email}</Table.Cell>
                      <Table.Cell>
                        {admin.managed_restaurant
                          ? admin.managed_restaurant.name
                          : "N/A"}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end space-x-2">
                          <Link to={`/edit-restaurant-admin/${admin.id}`}>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleDelete(admin.id)}
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
                  totalPages={Math.ceil(admins.length / itemsPerPage)}
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

export default RestaurantAdmins;
