import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Sidebar,
  Navbar,
  Dropdown,
  Avatar,
  Card,
  Rating,
  Badge,
} from "flowbite-react";
import { IoBusiness } from "react-icons/io5";
import { MdHistory } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
import logo from "../assets/images/logo.png";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const CustomerDashboard = () => {
  const [user, setUser] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, []);

  useEffect(() => {
    if (user?.sub) {
      fetchUserLocation();
    }
  }, [user]);

  const fetchUserLocation = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/locations/${user.sub}`
      );

      if (response.data.length > 0) {
        const userLocation = response.data[0];
        if (userLocation.latitude && userLocation.longitude) {
          setUserLocation({
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          });
        }
      } else {
        alert(
          "You need to set your location before viewing nearby restaurants."
        );
        navigate("/set-location"); 
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchRestaurants();
    }
  }, [userLocation]);

  const fetchRestaurants = async () => {
    if (!userLocation) return;
  
    try {
      const response = await axios.get("http://127.0.0.1:8000/restaurants/");
      const allRestaurants = response.data;
  
      const filteredRestaurants = allRestaurants.filter((restaurant) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          restaurant.latitude,
          restaurant.longitude
        );
        console.log("User Location:", userLocation);
        console.log("Restaurant:", restaurant.latitude, restaurant.longitude, restaurant.delivery_radius_km);
        return distance <= restaurant.delivery_radius_km; 
      });
  
      setRestaurants(filteredRestaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({});
    navigate("/");
  };

  const handleViewRestaurant = (id) => {
    navigate(`/restaurant/${id}`);
  };

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/customer-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Restaurants
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
                Restaurants
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
          <div className="mb-4">
            <input
              type="search"
              placeholder="Search for restaurants..."
              className="p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id}>
                <img
                  src={`http://localhost:8000${
                    restaurant.image_url ||
                    "/uploads/menu_items/placeholder.png"
                  }`}
                  alt="Restaurant"
                  className="h-28 w-full object-cover mb-4 rounded-lg"
                />
                <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {restaurant.name}
                </h5>
                {restaurant.is_on_promotion && (
                  <Badge color="success" className="mt-2">
                    Promotion!
                  </Badge>
                )}
                <Rating>
                  {[...Array(5)].map((_, index) => (
                    <Rating.Star
                      key={index}
                      filled={index < restaurant.stars}
                    />
                  ))}
                </Rating>
                <button
                  onClick={() => handleViewRestaurant(restaurant.id)}
                  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  View Restaurant
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
