import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Label, TextInput } from 'flowbite-react';
import logo from '../assets/images/logo.png';
import { jwtDecode } from "jwt-decode"; // Ispravan uvoz

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        try {
            console.log(credentials); 
            const response = await axios.post('http://127.0.0.1:8000/login/', credentials);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            const decodedToken = jwtDecode(access_token);
            console.log(decodedToken);
            const role = decodedToken.role;
    
            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (role === 'restaurant_admin') {
                navigate('/restaurant-dashboard');
            } else if (role === 'delivery_driver') {
                navigate('/delivery-driver-dashboard');
            } else {
                navigate('/customer-dashboard');
            }
        } catch (error) {
            console.error('Error logging in', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-blue-500 to-blue-300 justify-center items-center">
            <div className="flex justify-center w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin({ username: e.target.username.value, password: e.target.password.value });
                        }} 
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="username" value="Your username" />
                            <TextInput 
                                id="username" 
                                name='username'
                                type="text" 
                                required 
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Your password" />
                            <TextInput 
                                id="password" 
                                name='password'
                                type="password" 
                                required 
                                className="mt-1"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Login
                        </Button>
                    </form>
                    <p className="text-sm text-center mt-4">
                        Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
                    </p>
                </div>
                <div className="hidden lg:flex items-center justify-center w-full">
                    <img src={logo} alt="Logo" className="w-3/4 max-w-md" />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
