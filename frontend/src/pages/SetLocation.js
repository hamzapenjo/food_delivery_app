import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Sidebar, Navbar, Dropdown, Avatar } from "flowbite-react";
import { IoBusiness } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdHistory } from "react-icons/md";


const customIcon = L.icon({
  iconUrl: require("../assets/images/marker.png"), 
  iconSize: [38, 38], 
  iconAnchor: [19, 38],
});

const SetLocation = () => {
  const [user, setUser] = useState({});
  const [position, setPosition] = useState({ lat: 43.8563, lng: 18.4131 });
  const [locationName, setLocationName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser({
        id: decodedUser.sub, 
        email: decodedUser.email,
        profile_image: decodedUser.profile_image,
        role: decodedUser.role,
      });
    }
  }, []);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng); 
      },
    });

    return position === null ? null : (
      <Marker position={position} icon={customIcon}></Marker> 
    );
  };

  const handleSaveLocation = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedUser = jwtDecode(token);

      const locationData = {
        user_name: decodedUser.sub, 
        name: locationName,
        latitude: position.lat,
        longitude: position.lng,
      };

      console.log("Sending location data:", locationData);

      const response = await axios.post(
        "http://localhost:8000/save-location/",
        locationData
      );

      if (response.status === 201) {
        console.log("Location is successfully saved:", response.data);
      }

      alert("Location is successfully saved:");
    } catch (error) {
      console.error("Error", error);
      alert("Error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({});
    navigate("/");
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/customer-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Set Location
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
        <div className="p-8 flex-grow" style={{ marginTop: "3.6%" }}>
          <div style={{ height: "400px" }}>
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={13}
              style={{ height: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>
          <div className="p-8">
            <div>
              <label
                htmlFor="location-name"
                className="block text-sm font-medium text-gray-700"
              >
                Location Name
              </label>
              <input
                type="text"
                id="location-name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Set Location Name"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={handleSaveLocation}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetLocation;
