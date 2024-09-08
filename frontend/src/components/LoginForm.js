// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const LoginForm = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post('http://127.0.0.1:8000/login/', {
//                 email: email,
//                 password: password
//             });
//             const userRole = response.data.role;  // Pretpostavljamo da backend vraća ulogu

//             if (userRole === 'admin') {
//                 navigate('/admin-dashboard');
//             } else if (userRole === 'restaurant_admin') {
//                 navigate('/restaurant-dashboard');
//             } else if (userRole === 'delivery_driver') {
//                 navigate('/driver-dashboard');
//             } else {
//                 navigate('/customer-dashboard');
//             }
//         } catch (error) {
//             console.error('Error logging in', error);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <div>
//                 <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email"
//                     required
//                 />
//             </div>
//             <div>
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Password"
//                     required
//                 />
//             </div>
//             <button type="submit">Login</button>
//         </form>
//     );
// };

// export default LoginForm;
