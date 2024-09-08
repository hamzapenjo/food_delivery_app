import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";
import browse from "../assets/images/browse.webp";
import place from "../assets/images/place.webp";
import track from "../assets/images/track.webp";
import elcamino from "../assets/images/elcamino.webp";
import irongrill from "../assets/images/irongrill.webp";
import sakurasushi from "../assets/images/sakurasushi.webp";
import ladolcevita from "../assets/images/ladolcevita.webp";

const LandingPage = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="py-0 bg-gradient-to-r from-[#3f8df4] to-[#87bbff] text-white">
        <div className="container mx-auto flex justify-between ">
          <img src={logo} alt="BiteWay Logo" className="w-60" />
          <div className="mt-10">
            <Link to="/login">
              <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg mr-4">
                Log in
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg mr-4">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-[#3f8df4] to-[#87bbff] text-white py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            BiteWay: Fast, Fresh, and at Your Doorstep!
          </h1>
          <p className="text-xl font-light mb-8">
            Order from the best restaurants in your city and get your food
            delivered swiftly.
          </p>
          <Link to="/signup">
            <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
              Order Now
            </button>
          </Link>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-16 bg-white text-blue-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">How It Works</h2>
          <div className="flex flex-wrap justify-center">
            <div className="w-full md:w-1/3 px-6 mb-8">
              <div className="p-6 border rounded-lg shadow-lg bg-gray-50">
                <img
                  src={browse}
                  alt="Browse Restaurants"
                  className="mx-auto w-40 mb-6"
                />
                <h3 className="text-2xl font-semibold mb-2">
                  Browse Restaurants
                </h3>
                <p className="text-gray-600">
                  Explore a wide range of local restaurants and cuisines,
                  tailored to your preferences.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-6 mb-8">
              <div className="p-6 border rounded-lg shadow-lg bg-gray-50">
                <img
                  src={place}
                  alt="Order Food"
                  className="mx-auto w-40 mb-6"
                />
                <h3 className="text-2xl font-semibold mb-2">
                  Place Your Order
                </h3>
                <p className="text-gray-600">
                  Select your favorite dishes, add them to the cart, and proceed
                  to checkout in just a few clicks.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-6 mb-8">
              <div className="p-6 border rounded-lg shadow-lg bg-gray-50">
                <img
                  src={track}
                  alt="Track Delivery"
                  className="mx-auto w-40 mb-6"
                />
                <h3 className="text-2xl font-semibold mb-2">
                  Track Your Delivery
                </h3>
                <p className="text-gray-600">
                  Real-time tracking lets you follow your order from the kitchen
                  to your doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[#3f8df4] to-[#87bbff] text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">Why Choose BiteWay?</h2>
          <div className="flex flex-wrap justify-center">
            <div className="w-full md:w-1/3 px-6 mb-8">
              <div className="p-6 border rounded-lg shadow-lg bg-white text-blue-500">
                <h3 className="text-2xl font-semibold mb-4">
                  Lightning Fast Delivery
                </h3>
                <p>
                  We prioritize quick delivery without compromising food
                  quality. Your meal will be at your door, hot and fresh!
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-6 mb-8">
              <div className="p-6 border rounded-lg shadow-lg bg-white text-blue-500">
                <h3 className="text-2xl font-semibold mb-4">
                  Diverse Restaurant Selection
                </h3>
                <p>
                  From local favorites to international cuisines, enjoy a wide
                  variety of dining options, no matter your taste.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-6 mb-8">
              <div className="p-6 border rounded-lg shadow-lg bg-white text-blue-500">
                <h3 className="text-2xl font-semibold mb-4">
                  Real-Time Order Tracking
                </h3>
                <p>
                  Stay informed with live updates about your order's preparation
                  and delivery status from the moment it's placed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnered Restaurants Section */}
      <section className="py-16 bg-white text-blue-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">
            Partnered with Your Favorite Restaurants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 border rounded-lg shadow-lg">
              <img
                src={ladolcevita}
                alt="Restaurant 1"
                className="mx-auto mb-4 w-32 hover:scale-105 transition-transform"
              />
              <h3 className="text-2xl font-semibold">La Dolce Vita</h3>
            </div>
            <div className="p-6 border rounded-lg shadow-lg">
              <img
                src={elcamino}
                alt="Restaurant 2"
                className="mx-auto mb-4 w-32 hover:scale-105 transition-transform"
              />
              <h3 className="text-2xl font-semibold">El Camino Cantino</h3>
            </div>
            <div className="p-6 border rounded-lg shadow-lg">
              <img
                src={irongrill}
                alt="Restaurant 3"
                className="mx-auto mb-4 w-32 hover:scale-105 transition-transform"
              />
              <h3 className="text-2xl font-semibold">The Iron Grill</h3>
            </div>
            <div className="p-6 border rounded-lg shadow-lg">
              <img
                src={sakurasushi}
                alt="Restaurant 4"
                className="mx-auto mb-4 w-32 hover:scale-105 transition-transform"
              />
              <h3 className="text-2xl font-semibold">Sakura Sushi House</h3>
            </div>
          </div>
        </div>
      </section>

      {/* User Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-[#3f8df4] to-[#87bbff] text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-lg">
              <p className="text-lg italic">
                "BiteWay makes it so easy to get food from my favorite places!
                Fast delivery and great service."
              </p>
              <p className="text-white mt-4">- John Doe</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg">
              <p className="text-lg italic">
                "The real-time tracking is amazing. I know exactly when my food
                is coming!"
              </p>
              <p className="text-white mt-4">- Jane Smith</p>
            </div>
            <div className="p-6 border rounded-lg shadow-lg">
              <p className="text-lg italic">
                "Great variety of restaurants and super easy to use. Love
                BiteWay!"
              </p>
              <p className="text-white mt-4">- Alex Johnson</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-[#3f8df4] to-[#87bbff] text-white py-8">
        <div className="container mx-auto text-center">
          <p className="text-lg">BiteWay &copy; 2024. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="hover:underline">
              Contact Us
            </a>
            <a href="#" className="hover:underline">
              FAQs
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
