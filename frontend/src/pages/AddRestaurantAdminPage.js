import React, { useState, useEffect } from "react";
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
} from "flowbite-react";
import { IoFastFood, IoRestaurantOutline, IoBusiness } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { HiUsers } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

const AddRestaurantAdminPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/restaurants/");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/admin/create-restaurant-admin/", {
        name,
        email,
        hashed_password: password,
        restaurant_id: selectedRestaurant,
      });
      setSuccessMessage("Restaurant admin created successfully!");
      setTimeout(() => {
        navigate("/restaurant-admins");
      }, 2000);
    } catch (error) {
      console.error("Error creating restaurant admin:", error);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/admin-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Admin Dashboard - Add Restaurant Admin
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

        {/* Main content */}
        <div className="p-8 flex-grow login-signup-container">
          <div className="login-form-container">
            <div className="add-restaurant-card">
              <h2 className="mb-6 block">Create Restaurant Admin</h2>
              <form className="flex flex-col gap-0">
                <div className="mb-4 block">
                  <Label htmlFor="name" value="Name" />
                  <TextInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="mb-4 block">
                  <Label htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="mb-4 block">
                  <Label htmlFor="password" value="Password" />
                  <TextInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="mb-4 block">
                  <Label htmlFor="restaurant" value="Assign Restaurant" />
                  <Select
                    id="restaurant"
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
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
                {successMessage && (
                  <div className="flex justify-center mt-4">
                    <p className="success-message">{successMessage}</p>
                  </div>
                )}
                <div className="form-actions flex justify-between mt-4">
                  <Button
                    type="button"
                    onClick={handleCreate}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                  >
                    Create Admin
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

export default AddRestaurantAdminPage;
