import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Sidebar, Dropdown, Avatar } from "flowbite-react";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/images/logo.png";
import { IoFastFood, IoRestaurantOutline, IoBusiness } from "react-icons/io5";
import { HiUsers } from "react-icons/hi";

const AdminLayout = ({ children }) => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser({
        name: decodedUser.sub,
        role: decodedUser.role,
        email: decodedUser.email,
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
        <div className="p-8 flex-grow">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
