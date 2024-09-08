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
  FileInput,
} from "flowbite-react";
import { IoFastFood, IoRestaurantOutline, IoBusiness } from "react-icons/io5";
import logo from "../assets/images/logo.png";
import { HiUsers } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = L.icon({
  iconUrl: require("../assets/images/marker.png"),
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const AddRestaurantPage = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stars, setStars] = useState("");
  const [category, setCategory] = useState("");
  const [foodTypes, setFoodTypes] = useState([]);
  const [restaurantTypes, setRestaurantTypes] = useState([]);
  const [selectedFoodType, setSelectedFoodType] = useState("");
  const [selectedRestaurantType, setSelectedRestaurantType] = useState("");
  const [deliveryRadius, setDeliveryRadius] = useState("");
  const [latitude, setLatitude] = useState(43.8563);
  const [longitude, setLongitude] = useState(18.4131);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const categories = [
    "Fast Food",
    "Casual Dining",
    "Fine Dining",
    "Cafe",
    "Buffet",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }

    fetchFoodTypes();
    fetchRestaurantTypes();
  }, []);

  const fetchFoodTypes = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/food-types/");
      setFoodTypes(response.data);
    } catch (error) {
      console.error("Error fetching food types:", error);
    }
  };

  const fetchRestaurantTypes = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/restaurant-types/"
      );
      setRestaurantTypes(response.data);
    } catch (error) {
      console.error("Error fetching restaurant types:", error);
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleImageUpload = async (restaurantId) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("restaurant_id", restaurantId);

    try {
      const imageResponse = await axios.post(
        "http://127.0.0.1:8000/upload-restaurant-image/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return imageResponse.data.image_url;
    } catch (error) {
      console.error("Error during image upload:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/restaurants/", {
        name,
        address,
        city,
        stars: parseFloat(stars),
        category,
        food_type_id: selectedFoodType || null,
        restaurant_type_id: selectedRestaurantType || null,
        delivery_radius_km: parseFloat(deliveryRadius),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        admin_id: user.sub || 9,
      });

      if (response.status === 200) {
        const restaurantId = response.data.id;
        if (imageFile) {
          await handleImageUpload(restaurantId);
        }
        setSuccessMessage("Saved successfully!");
        setName("");
        setAddress("");
        setCity("");
        setStars("");
        setCategory("");
        setSelectedFoodType("");
        setSelectedRestaurantType("");
        setDeliveryRadius("");
        setLatitude(43.8563);
        setLongitude(18.4131);
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
      },
    });

    return latitude === null || longitude === null ? null : (
      <Marker position={[latitude, longitude]} icon={customIcon}></Marker>
    );
  };

  return (
    <div>
      <Navbar fluid className="bg-transparent shadow-lg">
        <Navbar.Brand href="/admin-dashboard">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">
            Admin Dashboard - Add Restaurant
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
        <div className="p-8 flex-grow">
          <div
            className="bg-white rounded-lg shadow-lg p-6"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            <div>
              <h2 className="mb-6 block text-2xl font-semibold">
                Add New Restaurant
              </h2>
              <form className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="name" value="Restaurant Name" />
                  <TextInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Restaurant Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address" value="Address" />
                  <TextInput
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city" value="City" />
                  <TextInput
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stars" value="Stars" />
                  <TextInput
                    id="stars"
                    type="number"
                    value={stars}
                    onChange={(e) => setStars(e.target.value)}
                    placeholder="Stars (1-5)"
                    min="1"
                    max="5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" value="Category" />
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="foodType" value="Food Type" />
                  <Select
                    id="foodType"
                    value={selectedFoodType}
                    onChange={(e) => setSelectedFoodType(e.target.value)}
                  >
                    <option value="">Select Food Type</option>
                    {foodTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="restaurantType" value="Restaurant Type" />
                  <Select
                    id="restaurantType"
                    value={selectedRestaurantType}
                    onChange={(e) => setSelectedRestaurantType(e.target.value)}
                  >
                    <option value="">Select Restaurant Type</option>
                    {restaurantTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </form>
            </div>
            <div>
              <Label htmlFor="map" value="Set Location on Map" />
              <div style={{ height: "340px" }}>
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={13}
                  style={{ height: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                </MapContainer>
              </div>
              <br></br>
              <div>
                <Label htmlFor="deliveryRadius" value="Delivery Radius (km)" />
                <TextInput
                  id="deliveryRadius"
                  type="number"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  placeholder="Delivery Radius in km"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="file-upload" value="Upload Image" />
                <FileInput
                  id="file-upload"
                  helperText="SVG, PNG, JPG or GIF (MAX. 800x400px)."
                  onChange={handleImageChange}
                />
              </div>
              {successMessage && (
                  <div className="flex justify-center mt-4">
                    <p className="success-message">{successMessage}</p>
                  </div>
                )}
              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold rounded mr-4"
                >
                  Save
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold rounded"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurantPage;
