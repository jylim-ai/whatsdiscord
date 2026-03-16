import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Check } from 'lucide-react';


const Profile = () => {

  const [user, setUser] = useState([]);    
  const [userName, setUserName] = useState([]);
  const [userEmail, setUserEmail] = useState([]);
  const [userPassword, setUserPassword] = useState([]);
  const [newUserPassword, setNewUserPassword] = useState([]);
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState([]);
  const [modifyUserName, setModifyUserName] = useState(false);
  const [modifyUserPassword, setModifyUserPassword] = useState(false);

useEffect(()=> {
        const getUser = async () => {
            try {
            const res = await fetch("http://localhost:5000/api/getProfile", {
              method: 'POST',
              credentials: 'include', // this sends the cookie back to server
            });

            if (res.status == 401) {
              navigate('/');
              
            }
    
            const data = await res.json();
            



            setUser(data);
            setUserName(data.name);
            setUserEmail(data.email);
            setUserPassword(data.password_hash);
    

            } catch (err) {
            console.error("Not authenticated");
            }
        };
    
        getUser();
        
      },[location.pathname]);







      const handleModifyUserName = async (userid, username) => {
          try {

              const res = await fetch("http://localhost:5000/api/editUserName", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ userid, username })
              });                
              if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUserName(username)
                    setModifyUserName(false)
                }
            } else {
                console.error('Failed to send request');
            }
                    

          } catch (err) {
              console.error("REST fetch failed:", err);
              return [];
          }

          
    };

    


    return (
        <div class="flex flex-col h-full items-center flex-1 bg-amber-50 text-black">
          <div class="h-full">
          <h3>Profile</h3>
          <div class="h-2/12">
            <img
              src="/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
              alt="User Avatar"
              className="h-full rounded-full"
              />
            </div>

            
            <div class="mt-2">
              <label for="input-label" class="block text-sm font-medium mb-2">Name</label>
              {!modifyUserName ? (
                <div class="flex justify-between">
                  <p>{userName}</p>
                  <span onClick={() => setModifyUserName(true)}><Pencil /></span>
                </div>
              ) : (
                <div class="flex justify-between">
                  <input id="input-label" value={userName} onChange={(e) => setUserName(e.target.value)} class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="you@site.com" />
                  <span onClick={() => handleModifyUserName(user.userId, userName)}><Check /></span>
                </div>
              )}
            </div>

            <div class="mt-2">
              <label for="input-label" class="block text-sm font-medium mb-2">Email</label>
              <div class="flex">
                  <p>{userEmail}</p>
                </div>
            </div>

            <div class="mt-2">
              <label for="input-label" class="block text-sm font-medium mb-2">Password</label>
              {!modifyUserPassword ? (
                <div class="flex">
                  <input type="password" value={userPassword} onChange={(e) => setUserName(e.target.value)} class="p-0 block w-full border-none bg-transparent sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"/>
                  <span onClick={() => setModifyUserPassword(true)}><Pencil /></span>
                </div>
              ) : (
                <div class="flex align-middle">
                  <div>
                  <label for="input-label" class="block text-sm font-medium mb-2">Name</label>
                  <input id="input-label" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="you@site.com" />
                  <label for="input-label" class="block text-sm font-medium mb-2">Name</label>
                  <input id="input-label" value={newUserConfirmPassword} onChange={(e) => setNewUserConfirmPassword(e.target.value)} class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="you@site.com" />
                  </div>
                  <span onClick={() => handleModifyUserName(user.userId, userName)}><Check /></span>
                </div>
              )}
            </div>



          </div>

              

              
              

            
        </div>
    )
}






export default Profile;