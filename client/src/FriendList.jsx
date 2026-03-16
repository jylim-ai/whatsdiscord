import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useContext } from "react";
import MessageList from "./pages/MessageList";
import MessageInput from "./pages/MessageInput";
import { io } from "socket.io-client";
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import Searchbar from './components/Searchbar';
import Sidebar from "./components/Sidebar";
import Pagination from "./components/Pagination";
import Modal from "./components/modal";
import { UserPlus } from 'lucide-react';
import { Check } from 'lucide-react';
import { socket } from "./socket";

const FriendList = forwardRef (() => {

  const [user, setUser] = useState([]);

  // user friend
  const [userFriend, setUserFriend] = useState([]);
  const [nextUserFriendIdCursor, setNextUserFriendIdCursor] = useState('');
  const [hasUserFriendMore, setHasUserFriendMore] = useState(true);

  // find user
  const [userQuery, setUserQuery] = useState("");
  const [userArray, setUserArray] = useState([]);
  const [nextUserIdCursor, setNextUserIdCursor] = useState('');
  const [hasUserMore, setHasUserMore] = useState(true);

  // request
  const [nextRequestIdCursor, setNextRequestIdCursor] = useState('');
  const [hasRequestMore, setHasRequestMore] = useState(true);
  const [usersCount, setUsersCount] = useState();
  const [friendRequestSent, setFriendRequestSent] = useState([]);

  
  const [friendRequestApprove, setFriendRequestApprove] = useState([]);
  const [friendRequestPendingArray, setFriendRequestPendingArray] = useState([]);

  const [loading, setLoading] = useState(true);
  const [totalNotification, setTotalNotification] = useState(0);

  const navigate = useNavigate();
  const stateRef = useRef({user, userQuery, nextUserIdCursor, hasUserMore, nextRequestIdCursor, hasRequestMore, totalNotification, nextUserFriendIdCursor, hasUserFriendMore});

    useEffect(() => {
        stateRef.current = {user, userQuery, nextUserIdCursor, hasUserMore, nextRequestIdCursor, hasRequestMore, totalNotification, nextUserFriendIdCursor, hasUserFriendMore};
    },[user, userQuery, nextUserIdCursor, hasUserMore, nextRequestIdCursor, hasRequestMore, totalNotification, nextUserFriendIdCursor, hasUserFriendMore])
    

    const {friendNotificationRefChange, broadcastingFriendNotification} = useOutletContext();

    useEffect(() => {
        window.HSStaticMethods.autoInit();
    }, []);

    useEffect(()=> {
        const getUser = async () => {
            try {
            const res = await fetch("http://localhost:5000/api/user", {
              method: 'GET',
              credentials: 'include', // this sends the cookie back to server
            });

            if (res.status == 401) {
              navigate('/');
              
            }
    
            const data = await res.json();
            
            setUser(data);
    
    

            } catch (err) {
            console.error("Not authenticated");
            }
        };
    
        getUser();
        
      },[location.pathname]);


    
    const getUserFriend = async () => {
      setLoading(true); // start spinner
      try {
        const res = await fetch("http://localhost:5000/api/getUserFriend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUserFriend(data);
      } catch (err) {
        console.error("REST fetch failed:", err);
      } finally {
        setLoading(false); // stop spinner (success or error)
      }
    };

    
    const handleGetUsers = async (query = "", user , cursor = "" ) => {


        if (!cursor) {
            setUserArray([]);
        }


  try {
    const params = new URLSearchParams({
      limit: 10,
      search: query,
      us: user
    });
    if (cursor) {
      params.append('nextIdCursor', cursor);
    }

    const res = await fetch(`/api/getAllUsers?${params.toString()}`);
    const data = await res.json();

    setUserArray((prev) => [...prev, ...data.users]);
    setNextUserIdCursor(data.nextCursor.id); // <- triggers useEffect to update ref
    setHasUserMore(data.hasMore);
  } catch (err) {
    console.error(err);
  } 
};


    const getUsersCount = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/getUsersCount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                });                
                if (!res.ok) {
                throw new Error("Failed to fetch users");
                }
                const data = await res.json();
                setUsersCount(data[0].total);
            } catch (err) {
                console.error("REST fetch failed:", err);
                return [];
            }
    };

    useEffect(() => {
        getUsersCount();
        getFriendRequestPending(user);
    },[user])
    
    useEffect(() => {
        getUserFriend();
    },[])


    
     const handleGetUsersWithoutCursor = () => {

      let userId = stateRef.current.user.userId;

        if (userQuery.trim()) {
            handleGetUsers(stateRef.current.userQuery, userId);
        }
        };

  const handleSendFriendRequest = async (receiver) => {

    const newReq = {
      user,
      receiver,
    };          
    setFriendRequestSent((prev) => ([...prev, receiver])); // ✅ update UI to "Pending"
                        
    socket.emit("friend request:send", newReq);


  }

  const getFriendRequestPending = async (user = "", cursor = "") => {
        try {
            const res = await fetch("http://localhost:5000/api/getFriendRequest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ us: user, ...(cursor && { nextIdCursor: cursor }) }),
            });                
            
            if (res.ok) {
              const data = await res.json();
              setFriendRequestPendingArray((prev) => ([...prev, ...data.request])); // ✅ update UI to "Pending"
              setHasRequestMore(data.hasMore);
              setNextRequestIdCursor(data.cursorId);
              setTotalNotification(data.request.length)
            } else {
                console.error('Failed to send request');
            }
            
        } catch (err) {
            console.error("REST fetch failed:", err);
            return [];
        }
  }

  const handleApproveRejectRequestPending = async (request,status) => {
    try {
      const res = await fetch("http://localhost:5000/api/updateFriendRequestStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({request,status})
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFriendRequestApprove((prev) => [...prev, request]);
          setTotalNotification((prev) => prev - 1);

          friendNotificationRefChange(stateRef.current.totalNotification);
        }
      } else {
          console.error('Failed to send request');
      }
    }catch(err) {
      console.error("REST fetch failed:", err);
      return [];
    }
  }




  
  useEffect(() => {
    if (broadcastingFriendNotification.length > 0) {
      setFriendRequestPendingArray((prev) => [...prev, broadcastingFriendNotification])
    } 
  },[broadcastingFriendNotification])



  const observer = useRef();
  const lastUserRef = useCallback(
    (node) => {

      const userId = stateRef.current.user.userId;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && stateRef.current.hasUserMore) {
          handleGetUsers(stateRef.current.userQuery, userId, stateRef.current.nextUserIdCursor);
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasUserMore]
  );

  const lastRequestRef = useCallback(
    (node) => {

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && stateRef.current.hasRequestMore) {
          getFriendRequestPending();
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasRequestMore]
  );

  

    return (
        <div class="h-full flex flex-col flex-1 bg-amber-50">
          
          <div class="mt-2 ml-8">
            <nav class="flex gap-x-1" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                <button type="button" class="hs-tab-active:bg-gray-200 hs-tab-active:text-gray-800 hs-tab-active:hover:text-gray-800 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-500 rounded-lg hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none active" id="pills-on-gray-color-item-1" aria-selected="true" data-hs-tab="#pills-on-gray-color-1" aria-controls="pills-on-gray-color-1" role="tab">
                    All
                </button>
                <button type="button" class="hs-tab-active:bg-gray-200 hs-tab-active:text-gray-800 hs-tab-active:hover:text-gray-800 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-500 rounded-lg hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none" id="pills-on-gray-color-item-2" aria-selected="false" data-hs-tab="#pills-on-gray-color-2" aria-controls="pills-on-gray-color-2" role="tab">
                    Online
                </button>
                <button type="button" class="hs-tab-active:bg-gray-200 hs-tab-active:text-gray-800 hs-tab-active:hover:text-gray-800 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-500 rounded-lg hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none" id="pills-on-gray-color-item-3" aria-selected="false" data-hs-tab="#pills-on-gray-color-3" aria-controls="pills-on-gray-color-3" role="tab">
                    Friend Requests
                    <span>{totalNotification}</span>
                </button>
                <button type="button" class="hs-tab-active:bg-gray-200 hs-tab-active:text-gray-800 hs-tab-active:hover:text-gray-800 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium text-center text-gray-500 rounded-lg hover:text-blue-600 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none" id="pills-on-gray-color-item-4" aria-selected="false" data-hs-tab="#pills-on-gray-color-4" aria-controls="pills-on-gray-color-4" role="tab">
                    Add Friend
                </button>
            </nav>
            </div>

        <div class="mt-3 p-13 h-full overflow-y-auto">
        <div id="pills-on-gray-color-1" class="relative" role="tabpanel" aria-labelledby="pills-on-gray-color-item-1">
          

            { loading && (
              <div class="absolute flex items-center justify-center w-full align z-50">
                <div class="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                  <span class="sr-only">Loading...</span>
                </div>
              </div>
              )
            }
          
          
            <div class="grid grid-cols-3 gap-7">
                { userFriend.map((user) => (
            
                    <button class="flex mb-2 text-black rounded shadow-md hover:shadow-lg hover:-translate-y-1 transition-all" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-basic-modal" data-hs-overlay="#hs-basic-modal" onClick = {() => handleSelectFriendModal(user)}>
                        <img
                        src="/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full"
                        />
                        <div class="p-2">
                            {user.name}
                        </div>
                    </button>
                    
                    )
                )}
            </div>
            
            
        </div>

        <div id="pills-on-gray-color-2" role="tabpanel" aria-labelledby="pills-on-gray-color-item-2">
            <div class="grid grid-cols-3 gap-7">
                { userFriend.map((user) => (
            
                    <button class="flex mb-2 text-black rounded shadow-md hover:shadow-lg hover:-translate-y-1 transition-all" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-basic-modal" data-hs-overlay="#hs-basic-modal" onClick = {() => handleSelectFriendModal(user)}>
                        <img
                        src="/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full"
                        />
                        <div class="p-2">
                            {user.name}
                        </div>
                    </button>
                    
                    )
                )}
            </div>
        </div>
        
        <div id="pills-on-gray-color-3" class="hidden" role="tabpanel" aria-labelledby="pills-on-gray-color-item-3">
            <div>
              {friendRequestPendingArray.map((frequest, index) => {
                const isLast = index === friendRequestPendingArray.length - 1;
                return (
                  <div
                    key={frequest.friend_requests_id}
                    ref={isLast ? lastRequestRef : null}
                    className="flex items-center justify-between gap-4 p-3 border-b bg-gray-500"
                  >
                    <img
                      src="/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                      />
                    <div>{frequest.name}</div>
                    {friendRequestApprove.includes(frequest.friend_requests_id) ? <button>Request Sent</button> : 
                    <div>
                      <button onClick={() => handleApproveRejectRequestPending(frequest.friend_requests_id,"Accept")}>Approve</button>
                      <button onClick={() => handleApproveRejectRequestPending(frequest.friend_requests_id,"Decline")}>Reject</button>
                    </div>
                    
                    }
                  </div>
                );
              })}
            </div>
        </div>

        <div id="pills-on-gray-color-4" class="hidden" role="tabpanel" aria-labelledby="pills-on-gray-color-item-4">
          
          <div class="flex flex-col h-full">
            <div class="p-5">
              <p class="text-center">Add a new friend</p>
              <div class="flex rounded-lg">
              <input type="text" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} id="hs-trailing-button-add-on-with-icon" name="hs-trailing-button-add-on-with-icon" class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-s-lg sm:text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />
              <button type="button" onClick={handleGetUsersWithoutCursor} class="size-11.5 shrink-0 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-e-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                  <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                  </svg>
              </button>
              </div>
            </div>

            <div class="overflow-y-auto h-96">
              {userArray.map((user, index) => {
                const isLast = index === userArray.length - 1;
                return (
                  <div
                    key={user.users_id}
                    ref={isLast ? lastUserRef : null}
                    className="flex items-center justify-between gap-4 p-3 border-b"
                  >
                    <img
                      src="/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                      />
                    <div>{user.name}</div>
                    {friendRequestSent.includes(user.users_id) ? ( <button class="flex rounded p-2 bg-white text-green-500"><Check />Request Sent</button> ) : (
                    user.receiver_id === null ? ( <button class="flex rounded p-2 bg-green-500 text-white" onClick={() => handleSendFriendRequest(user.users_id)}><span><UserPlus /></span>Add Friend</button> ) : ( <button class="flex rounded p-2 bg-white text-green-500"><Check />Request Sent</button> ) )}
                  </div>
                );
              })}

            </div>
          </div>
          

        </div>
        </div>

        
    </div>
        
    )
})

export default FriendList;