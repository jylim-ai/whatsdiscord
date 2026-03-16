import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheckBig } from 'lucide-react';
import { CircleX } from 'lucide-react';

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordLength, setPasswordLength] = useState(false);
    const [passwordCase, setPasswordCase] = useState(false);
    const [passwordNumber, setPasswordNumber] = useState(false);
    const [passwordSymbol, setPasswordSymbol] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [passwordConfirmSecond, setPasswordConfirmSecond] = useState(false);

    const navigate = useNavigate();





    const handleNavigateLogin = async () => {
        navigate('/')
    }




    const checkStrength = (pwd) => {
        setPassword(pwd)

        if (pwd.length >= 8 && pwd.length <= 15) {
            setPasswordLength(true);
        } else {
            setPasswordLength(false);
        };

        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) {
            setPasswordCase(true);
        } else {
            setPasswordCase(false);
        };

        if (/[0-9]/.test(pwd)) {
            setPasswordNumber(true);
        } else {
            setPasswordNumber(false);
        }

        if (/[^A-Za-z0-9]/.test(pwd)) {
            setPasswordSymbol(true);
        } else {
            setPasswordSymbol(false);
        }

        if (passwordConfirm == pwd) {
            setPasswordConfirmSecond(true);
        } else {
            setPasswordConfirmSecond(false);
        }

        
    };
    

    const checkAgain = (pwd) => {
        setPasswordConfirm(pwd);
        

        if ((password == pwd) && password != "") {
            setPasswordConfirmSecond(true);
        } else {
            setPasswordConfirmSecond(false);
        }

    }


    const handleSignup = async (e) => {
        e.preventDefault();

        if (passwordLength && passwordCase && passwordNumber && passwordSymbol && passwordConfirmSecond) {
        
            try{
                const response = await fetch('http://localhost:5000/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = response.json();

                if(!response) {
                    throw new Error(data.error || 'Login failed');
                }

                alert('Signup Successful!');
            } catch(error) {
                alert(`Signup Failed ! ${error.message}`);
            }
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center" style={{backgroundImage: "url('/42887448_SL-120722-54400-35.jpg')"}}>
            <div className="bg-white p-6 rounded shadow-md w-96">
                <form onSubmit={handleSignup}>
                    <h2 className="text-xl text-black font-bold mb-4">Signup to Chat</h2>

                    <label for="name" className="block mb-1 text-black text-sm/6 font-medium">Name</label>
                    <input
                    required
                    id="name"
                    type="text"
                    placeholder="Name"
                    className="w-full text-black mb-3 p-2 border rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />
                    <label for="email" className="block mb-1 text-black text-sm/6 font-medium">Email address</label>
                    <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="w-full text-black mb-3 p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <label for="password" class="block mb-1 text-black text-sm/6 font-medium">Password</label>
                    <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    className="w-full text-black mb-1 p-2 border rounded"
                    value={password}
                    onChange={(e) => checkStrength(e.target.value)}
                    />
                    {!passwordLength? (
                        <div class="flex items-center gap-0.5 text-sm text-red-500">
                            <p>Contains 8 - 15 characters</p><CircleX size={11} />
                        </div>
                    ) : (
                        <div class="flex items-center gap-0.5 text-sm text-green-500">
                            <p>Contains 8 - 15 characters</p><CircleCheckBig size={11} />
                        </div>
                    )}
                    {!passwordCase ? (
                        <div class="flex items-center gap-0.5 text-sm text-red-500">
                            <p>Contains UpperCase and LowerCase</p><CircleX size={11} />
                        </div>
                    ) : (
                        <div class="flex items-center gap-0.5 text-sm text-green-500">
                            <p>Contains UpperCase and LowerCase</p><CircleCheckBig size={11} />
                        </div>
                    )}
                    {!passwordNumber ? (
                        <div class="flex items-center gap-0.5 text-sm text-red-500">
                            <p>Contains Numbers</p><CircleX size={11} />
                        </div>
                    ) : (
                        <div class="flex items-center gap-0.5 text-sm text-green-500">
                            <p>Contains Numbers</p><CircleCheckBig size={11} />
                        </div>
                    )}
                    {!passwordSymbol ? (
                        <div class="flex items-center gap-0.5 text-sm text-red-500">
                            <p>Contains Symbols</p><CircleX size={11} />
                        </div>
                    ) : (
                        <div class="flex items-center gap-0.5 text-sm text-green-500">
                            <p>Contains Symbols</p><CircleCheckBig size={11} />
                        </div>
                    )}
                    
                    
                    
                    <label for="confirm_password" class="block mb-1 text-black text-sm/6 font-medium">Confirm Password</label>
                    <input
                    id="confirm_password"
                    type="password"
                    placeholder="Type Password Again"
                    className="w-full text-black p-2 border rounded"
                    value={passwordConfirm}
                    onChange={(e) => checkAgain(e.target.value)}
                    />
                    {!passwordConfirmSecond? (
                        <div class="flex items-center gap-0.5 text-sm text-red-500">
                            <p>Contains same password</p><CircleX size={11} />
                        </div>
                    ) : (
                        <div class="flex items-center gap-0.5 text-sm text-green-500">
                            <p>Contains same password</p><CircleCheckBig size={11} />
                        </div>
                    )}
                    <button className="w-full mt-6 bg-blue-600 text-white p-2 rounded">
                    Signup
                    </button>
                </form>

                <div className="mt-10">
                    <p className="mt-10 text-center text-sm/6 text-gray-400">
                        Already a member?
                        <a onClick={handleNavigateLogin} className="ml-1 font-semibold text-indigo-400 hover:text-indigo-300">Sign in</a>
                    </p>
                </div>
                
            </div>
        </div>
    )

}

export default Signup;