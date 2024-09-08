import React from 'react';
import axios from 'axios';
import { Button, Label, TextInput } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const SignupPage = () => {
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        const { name, email, password } = e.target.elements;

        try {
            const response = await axios.post('http://127.0.0.1:8000/users-signup/', {
                name: name.value,
                email: email.value,
                hashed_password: password.value, 
            });

            if (response.status === 200) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error signing up', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-blue-500 to-blue-300 justify-center items-center">
            <div className="flex justify-center w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <Label htmlFor="name" value="Your name" />
                            <TextInput 
                                id="name" 
                                type="text" 
                                required 
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" value="Your email" />
                            <TextInput 
                                id="email" 
                                type="email" 
                                required 
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" value="Your password" />
                            <TextInput 
                                id="password" 
                                type="password" 
                                required 
                                className="mt-1"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Sign Up
                        </Button>
                    </form>
                    <p className="text-sm text-center mt-4">
                        Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
                    </p>
                </div>
                <div className="hidden lg:flex items-center justify-center w-full">
                    <img src={logo} alt="Logo" className="w-3/4 max-w-md" />
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
