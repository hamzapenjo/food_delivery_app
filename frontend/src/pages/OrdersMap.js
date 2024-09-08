import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sidebar,
  Navbar,
  Dropdown,
  Avatar,
  Toast,
} from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { HiX } from "react-icons/hi";
import { jwtDecode } from "jwt-decode";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaMapMarkedAlt } from "react-icons/fa";

const customIcon = L.icon({
  iconUrl: require("../assets/images/marker.png"),
  iconSize: [38, 38],
  iconAnchor: [19, 38], 
});

const OrdersMap = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState({});
  const [showToast, setShowToast] = useState(false);
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
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  return (
    <div>
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/delivery-driver-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Delivery Driver Dashboard - Orders Map
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
              <div style={{ height: "500px" }}>
                <MapContainer
                  center={[43.8563, 18.4131]}
                  zoom={13}
                  style={{ height: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {orders.map((order) =>
                    order.latitude !== null && order.longitude !== null ? (
                      <Marker
                        key={order.id}
                        position={[order.latitude, order.longitude]} 
                        icon={customIcon}
                      >
                        <Popup>
                          <strong>Order ID:</strong> {order.id} <br />
                          <strong>Customer Name:</strong> {order.customer_name} <br />
                          <strong>Status:</strong> {order.status}
                        </Popup>
                      </Marker>
                    ) : null
                  )}
                </MapContainer>
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

export default OrdersMap;
