import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Card,
  Navbar,
  Dropdown,
  Button,
  FileInput,
  Label,
} from "flowbite-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 
import logo from "../assets/images/logo.png";

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [profile_image, setProfileImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        console.log("Decoded User:", decodedUser);
        setUser({
          name: decodedUser.sub,
          role: decodedUser.role,
          email: decodedUser.email,
          profile_image: decodedUser.profile_image,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    } else {
      handleLogout(); 
    }
  }, []);

  const handleImageUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", profile_image);
    formData.append("name", user.name);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload-profile-image/",
        formData
      );
      const newToken = response.data.new_token;
      if (newToken) {
        localStorage.setItem("token", newToken);
        const decodedUser = jwtDecode(newToken);
        setUser({ ...user, profile_image: decodedUser.profile_image });
      } else {
        console.error("Token nije vraćen nakon upload-a slike");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleBack = () => {
    navigate(getDashboardLink());
  };

  const getDashboardTitle = () => {
    switch (user.role) {
      case "admin":
        return "Admin Dashboard";
      case "restaurant_admin":
        return "Restaurant Admin Dashboard";
      case "delivery_driver":
        return "Delivery Driver Dashboard";
      default:
        return "Customer";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "restaurant_admin":
        return "Restaurant Admin";
      case "delivery_driver":
        return "Delivery Driver";
      default:
        return "User";
    }
  };

  const getDashboardLink = () => {
    switch (user.role) {
      case "admin":
        return "/admin-dashboard";
      case "restaurant_admin":
        return "/restaurant-dashboard";
      case "delivery_driver":
        return "/delivery-driver-dashboard";
      default:
        return "/customer-dashboard";
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href={getDashboardLink()}>
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            {getDashboardTitle()}
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

      {/* Main content */}
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-blue-300">
        <Card className="w-full max-w-sm text-center">
          <Avatar
            img={`http://localhost:8000${user.profile_image}`}
            rounded
            size="xl"
            className="mx-auto mb-4"
          />
          <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
            {user.name}
          </h5>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Role: {getRoleDisplayName(user.role)}
          </span>

          <form onSubmit={handleImageUpload} className="mt-4">
            <div className="mb-4">
              <Label
                htmlFor="file-upload-helper-text"
                value="Upload profile image"
              />
              <FileInput
                id="file-upload-helper-text"
                helperText="SVG, PNG, JPG or GIF (MAX. 800x400px)."
                onChange={(e) => setProfileImage(e.target.files[0])}
                accept="image/*"
                required
              />
            </div>

            <div className="mt-2 flex justify-center space-x-4">
              <Button type="submit" className="bg-green-500 hover:bg-green-700">
                Save Picture
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700"
              >
                Logout
              </Button>
              <Button
                onClick={handleBack}
                className="bg-blue-500 hover:bg-blue-700"
              >
                Back
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
