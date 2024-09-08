import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Sidebar,
  Table,
  Rating,
  Navbar,
  Dropdown,
  Avatar,
  Pagination,
} from "flowbite-react";
import { IoFastFood, IoRestaurantOutline, IoBusiness } from "react-icons/io5";
import { HiUsers } from "react-icons/hi";
import logo from "../assets/images/logo.png";

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [user, setUser] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }

    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/restaurants/");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({});
    navigate("/");
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/restaurants/${id}`);
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentRestaurants = restaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/admin-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Admin Dashboard - Restaurants
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

      <div className="flex h-full">
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

        {/* Main content */}
        <div className="p-2 flex-grow admin-dashboard-content">
          <div className="admin-dashboard-card mt-16">
            <div className="flex justify-end items-center mb-4">
              <Link to="/add-restaurant">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Add New Restaurant
                </button>
              </Link>
            </div>
            <div className="overflow-x-auto mt-8">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Address</Table.HeadCell>
                  <Table.HeadCell>City</Table.HeadCell>
                  <Table.HeadCell>Stars</Table.HeadCell>
                  <Table.HeadCell>Category</Table.HeadCell>
                  <Table.HeadCell>Food Type</Table.HeadCell>
                  <Table.HeadCell>Restaurant Type</Table.HeadCell>
                  <Table.HeadCell>Delivery Radius (km)</Table.HeadCell>
                  <Table.HeadCell>Image</Table.HeadCell>
                  <Table.HeadCell>
                    <span className="sr-only">Actions</span>
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {currentRestaurants.map((restaurant) => (
                    <Table.Row
                      key={restaurant.id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {restaurant.name}
                      </Table.Cell>
                      <Table.Cell>{restaurant.address}</Table.Cell>
                      <Table.Cell>{restaurant.city}</Table.Cell>
                      <Table.Cell>
                        <Rating>
                          {[...Array(5)].map((_, index) => (
                            <Rating.Star
                              key={index}
                              filled={index < restaurant.stars}
                            />
                          ))}
                        </Rating>
                      </Table.Cell>
                      <Table.Cell>{restaurant.category}</Table.Cell>
                      <Table.Cell>
                        {restaurant.food_type_name || "N/A"}
                      </Table.Cell>
                      <Table.Cell>
                        {restaurant.restaurant_type_name || "N/A"}
                      </Table.Cell>
                      <Table.Cell>{restaurant.delivery_radius_km} km</Table.Cell>
                      <Table.Cell>
                        <img
                          src={`http://localhost:8000${
                            restaurant.image_url ||
                            "/uploads/menu_items/placeholder.png"
                          }`}
                          alt="Restaurant"
                          className="h-12 w-12 object-cover"
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end space-x-2">
                          <Link to={`/edit-restaurant/${restaurant.id}`}>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                              Edit
                            </button>
                          </Link>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleDelete(restaurant.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(restaurants.length / restaurantsPerPage)}
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

export default AdminDashboard;
