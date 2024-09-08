import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./LoginSignup.css";
import "./App.css";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import DeliveryDriverDashboard from "./pages/DeliveryDriverDashboard";
import RestaurantAdminDashboard from "./pages/RestaurantAdminDashboard";
import AddRestaurantPage from "./pages/AddRestaurantPage";
import EditRestaurantPage from "./pages/EditRestaurantPage";
import FoodTypes from "./pages/FoodTypes";
import RestaurantTypes from "./pages/RestaurantTypes";
import AddFoodTypePage from "./pages/AddFoodTypePage";
import EditFoodTypePage from "./pages/EditFoodTypePage";
import AddRestaurantTypePage from "./pages/AddRestaurantTypePage";
import EditRestaurantTypePage from "./pages/EditRestaurantTypePage";
import AddRestaurantAdminPage from "./pages/AddRestaurantAdminPage";
import EditRestaurantAdminPage from "./pages/EditRestaurantAdminPage";
import RestaurantAdmins from "./pages/RestaurantAdmins";
import AddMenuItemPage from "./pages/AddMenuItemPage";
import EditMenuItemPage from "./pages/EditMenuItemPage";
import GroupMenusDashboard from "./pages/GroupMenusDashboard";
import AddGroupMenuPage from "./pages/AddGroupMenuPage";
import EditGroupMenuPage from "./pages/EditGroupMenuPage";
import DriverAdminPage from "./pages/DriverAdminPage";
import AddDriverPage from "./pages/AddDriverPage";
import EditDriverPage from "./pages/EditDriverPage";
import InvoicesDashboard from "./pages/InvoicesDashboard";
import EditInvoice from "./pages/EditInvoice";
import AddInvoicePage from "./pages/AddInvoicePage";
import DeliveryAdmin from "./pages/DeliveryAdmin";
import ProfilePage from "./pages/ProfilePage";
import SetLocation from "./pages/SetLocation";
import RestaurantDetails from "./pages/RestaurantDetails";
import OrderHistory from "./pages/OrderHistory";
import ProtectedRoute from "./pages/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import LandingPage from "./pages/LandingPage";
import OrdersMap from "./pages/OrdersMap";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute za signup i login */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin rute */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-restaurant"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddRestaurantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-restaurant/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditRestaurantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-types"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FoodTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-types"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestaurantTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-food-type"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddFoodTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-food-type/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditFoodTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-restaurant-type"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddRestaurantTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-restaurant-type/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditRestaurantTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-restaurant-admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddRestaurantAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-restaurant-admin/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditRestaurantAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-admins"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestaurantAdmins />
            </ProtectedRoute>
          }
        />

        {/* Rute za restaurant_admin */}
        <Route
          path="/restaurant-dashboard"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <RestaurantAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-menu-item"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <AddMenuItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-menu-item/:id"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <EditMenuItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group-menus"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <GroupMenusDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-group-menu"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <AddGroupMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-group-menu/:id"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <EditGroupMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <DriverAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-driver"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <AddDriverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-driver/:id"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <EditDriverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <InvoicesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-invoice"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <AddInvoicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-invoice/:id"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <EditInvoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery-admin"
          element={
            <ProtectedRoute allowedRoles={["restaurant_admin"]}>
              <DeliveryAdmin />
            </ProtectedRoute>
          }
        />

        {/* Delivery driver rute */}
        <Route
          path="/delivery-driver-dashboard"
          element={
            <ProtectedRoute allowedRoles={["delivery_driver"]}>
              <DeliveryDriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders-map"
          element={
            <ProtectedRoute allowedRoles={["delivery_driver"]}>
              <OrdersMap />
            </ProtectedRoute>
          }
        />

        {/* Customer rute */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <RestaurantDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/set-location"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <SetLocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
