import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { Button } from "flowbite-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-500 to-blue-300 justify-center items-center">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
        <img src={logo} alt="Logo" className="w-38 h-32 mb-8" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page.
        </p>
        <Button
          onClick={() => navigate(-1)} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
