import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/signup/', {
                name: name,
                email: email,
                hashed_password: password,
                role: role
            });

            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else if (role === 'restaurant_admin') {
                navigate('/restaurant-dashboard');
            } else if (role === 'delivery_driver') {
                navigate('/driver-dashboard');
            } else {
                navigate('/customer-dashboard');
            }
        } catch (error) {
            console.error('Error registering user', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                />
            </div>
            <div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
            </div>
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
            </div>
            <div>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="customer">Customer</option>
                    <option value="restaurant_admin">Restaurant Admin</option>
                    <option value="delivery_driver">Delivery Driver</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignupForm;
