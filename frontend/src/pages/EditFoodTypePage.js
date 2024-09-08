import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sidebar,
  Button,
  Label,
  TextInput,
  Navbar,
  Dropdown,
  Avatar,
} from "flowbite-react";
import { IoFastFood, IoRestaurantOutline, IoBusiness } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { HiUsers } from "react-icons/hi";
import { jwtDecode } from "jwt-decode";

const EditFoodTypePage = () => {
  const { id } = useParams(); 
  const [name, setName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      console.log("Dekodirani JWT token:", decodedUser);
      setUser(decodedUser);
    }

    fetchFoodType();
  }, []);

  const fetchFoodType = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/food-types/${id}`
      );
      setName(response.data.name);
    } catch (error) {
      console.error("Error fetching food type:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/food-types/${id}`,
        {
          name,
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Updated successfully!");
        navigate("/food-types"); 
      }
    } catch (error) {
      console.error("Error updating food type:", error);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/admin-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Admin Dashboard - Edit Food Type
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
              <h2 className="mb-6 block">Edit Food Type</h2>
              <form className="flex flex-col gap-0">
                <div className="mb-4 block">
                  <Label htmlFor="name" value="Food Type Name" />
                  <TextInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter food type name"
                    required
                  />
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

export default EditFoodTypePage;
