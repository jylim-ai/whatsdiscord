import React, { useState, useRef } from 'react';
import Signup from './Signup';
import { useNavigate } from 'react-router-dom';
import AlertStack from '../components/AlertStack';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    

    const handleNavigateSignup = async () => {
        navigate('/signup')
    }



    
    // 👇 Function to handle login
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }


            
            // You can now redirect or store user info in localStorage, context, etc.
            navigate('/ChatApp')
        } catch (error) {
            alert(`Login failed: ${error.message}`);
            Toastify({
                text: error.message,
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #ed0909, #f26650)",
                },
                
                }).showToast();
        }
    };

    return (
        <div>
            
            
            <div className="flex h-screen w-screen items-center justify-center" style={{backgroundImage: "url('/42887448_SL-120722-54400-35.jpg')"}}>
                
                <div className="bg-white p-6 rounded shadow-md w-96">
                    <form onSubmit={handleLogin}>
                        <h2 className="text-xl text-black font-bold mb-4">Login to Chat</h2>
                        <div className="mb-5">
                            <label for="email" className="block mb-2 text-black text-sm/6 font-medium">Email address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Email"
                                className="w-full text-black p-2 rounded"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-1">
                            <label for="password" class="block mb-2 text-black text-sm/6 font-medium">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Password"
                                className="w-full text-black p-2 border rounded"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div class="mb-2 text-end">
                            <a class="text-blue-700">Forgot Password ?</a>
                        </div>
                        
                        <div>
                            <button className="w-full mt-10 bg-blue-600 text-white p-2 rounded" type="submit">
                            Login
                            </button>
                        </div>

                        
                    </form>

                    <div>
                        <p className="text-center text-sm/6 text-gray-400">
                            Not a member?
                            <a onClick={handleNavigateSignup} className="ml-1 font-semibold cursor-pointer text-indigo-400 hover:text-indigo-300">Sign Up</a>
                        </p>
                    </div>
                    
                </div>
            </div>
        </div>
        
    );
}

export default Login;