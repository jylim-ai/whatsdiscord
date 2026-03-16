import React, { useState, useEffect, useRef } from "react";
import Searchbar from './components/Searchbar';
import Sidebar from "./components/Sidebar";
import UserModal from "./components/UserModal";
import { data, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { socket } from "./socket";

function Layout() {

  const location = useLocation();

  const navigate = useNavigate();

  const isHomePage = location.pathname === '/ChatApp';
  const isFriendListPage = location.pathname === '/ChatApp/FriendList';
  const isProfilePage = location.pathname === '/ChatApp/Profile';
  const [selectedUserModal, setSelectedUserModal] = useState([]);
  const [selectedGroupModal, setSelectedGroupModal] = useState([]);
  const [user, setUser] = useState([]);
  const [chatNotification, setChatNotification] = useState(0);
  const [friendNotification, setFriendNotification] = useState(0);
  const [broadcastingChatNotification, setBroadcastingChatNotification] = useState([]);
  const [broadcastingChatNotificationCount, setBroadcastingChatNotificationCount] = useState(0);
  const [broadcastingFriendNotification, setBroadcastingFriendNotification] = useState([]);
  const [broadcastingFriendNotificationCount, setBroadcastingFriendNotificationCount] = useState(0);

  const stateRef = useRef({user});

  useEffect(() => {
      stateRef.current = {user};
    },[user])








  
  
  useEffect(()=> {
      const getUser = async () => {
          try {
          const res = await fetch("http://localhost:5000/api/user", {
            method: 'GET',
            credentials: 'include', // this sends the cookie back to server
          });
  
          const data = await res.json();
          if (res.status == 401) {
            navigate('/');
            return;
          }


          setUser(data);
  
          } catch (err) {
          console.error("Not authenticated");
          }
      };
  
      getUser();
      
    },[]);
  
  const handleUserChatroom = (user) => {
    const newUser = {...user, chatroom_name: user.name, is_group: false, user_type: 'private'}
    if (!isHomePage) {
      navigate('', { state : { newUser} })  
    } else {
      setSelectedUserModal(newUser); 
    }    
  }

  const handleGroupChatroom = (group) => {
    const newGroup = {...group, is_group: true}
    setSelectedGroupModal(newGroup);
    navigate('', { state : { newGroup } })  
    
    
  }
  
  const handleCreateGroup = async (groupName, users) => {
          
    
    try {
            users = users.map(id => ({ userId: id, type: 'member' }));

            users.push({
              userId: stateRef.current.user.userId,
              type: 'admin'
            });

              const res = await fetch("http://localhost:5000/api/createGroup", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ groupName, users })
              });                
              if (!res.ok) {
              throw new Error("Failed to fetch users");
              }
              const data = await res.json();
              handleGroupChatroom(data);
          } catch (err) {
              console.error("REST fetch failed:", err);
              return [];
          }

         
        };

  const getFriendRequestPendingCount = async (user) => {
        try {
            const res = await fetch("http://localhost:5000/api/getFriendRequestCount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ us: user}),
            });                
            
            if (res.ok) {
              const data = await res.json();
              const { result } = data
              setBroadcastingFriendNotificationCount(result[0].total)
            } else {
                console.error('Failed to send request');
            }
            
        } catch (err) {
            console.error("REST fetch failed:", err);
            return [];
        }
  }

    const handleRoomNotificationChange = (value) => {
      setBroadcastingChatNotificationCount(value);
    }


    const handleFriendNotificationChange = (value) => {
      setBroadcastingFriendNotificationCount(value);
    };

    useEffect(() => {
      import('preline').then(({ HSOverlay }) => {
        HSOverlay?.autoInit();
      });
    });

    useEffect(() => {
        if (user.userId) {
          
          const userId = user.userId;
          socket.emit("identify", userId );
        
    
          socket.on("chat message:notifyreci", (msg) => {
            if (msg) {
              setBroadcastingChatNotification(msg);
              setBroadcastingChatNotificationCount((prev) => prev + 1);  
            }

          });

          socket.on("chat message:notifyread", (room) => {
            if (room) {
              setBroadcastingChatNotificationCount((prev) => prev - room.count);  
            }

          });

          
          socket.on("friend request:notifyreci", (req) => {
            if (req) {
              setBroadcastingFriendNotification(req);
              setBroadcastingFriendNotificationCount((prev) => prev + 1);  
            }

          });

          getFriendRequestPendingCount(userId);
    
          return () => {
            socket.off("chat message:notifyreci");
          };
        }
    
      }, [user]);
    


  return (
    <>
    <div class="h-screen flex flex-col">
      <Searchbar onUser={handleUserChatroom}/>

      <div class="flex flex-row flex-1 overflow-y-auto">

        <Sidebar messageCount={broadcastingChatNotificationCount} friendCount={broadcastingFriendNotificationCount} />

        { isHomePage && <div class="flex flex-1" data-hs-layout-splitter='{
        "horizontalSplitterTemplate": "<div><span class=\"absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 block w-4 h-6 flex justify-center items-center bg-white border border-gray-200 text-gray-400 rounded-md cursor-col-resize hover:bg-gray-100\"><svg class=\"shrink-0 size-3.5\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/></svg></span></div>",
        "horizontalSplitterClasses": "relative flex shadow-md"
        }'>

          <div class="flex flex-1" data-hs-layout-splitter-horizontal-group>           
            <Outlet context={{selectedUserModal, selectedGroupModal, broadcastingChatNotification, roomNotificationRefChange : handleRoomNotificationChange }}  /> {/* This renders the current page */}
          
          </div>          
        </div>
        }

        { isFriendListPage &&       
            <Outlet context={{friendNotificationRefChange: handleFriendNotificationChange, broadcastingFriendNotification }} /> /* This renders the current page */
          
       

        }

        { isProfilePage &&       
            <Outlet /> /* This renders the current page */
          
       

        }

         
      
      </div>

     <UserModal onCreateGroup={handleCreateGroup}  />

      
    </div>
      
    </>
  );
}

export default Layout;
