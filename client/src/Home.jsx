import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from "react";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import { io } from "socket.io-client";
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import Searchbar from './components/Searchbar';
import UserModal from "./components/UserModal";
import Test from "./pages/test";
import ChatListBar from "./components/ChatListBar";

import Sidebar from "./components/Sidebar";
import GroupChatSetting from "./pages/GroupChatSetting";
import { socket } from "./socket";


const Home = forwardRef(() => {
  

  const prevModalRef = useRef();

  const { selectedUserModal, selectedGroupModal, broadcastingChatNotification, roomNotificationRefChange} = useOutletContext();

  const [chatRooms, setchatRooms] = useState([]);
  
  const [chatListType, setChatListType] = useState('tab1');
  const [user, setUser] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [groupSetting, setGroupSetting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const userFriendList = location?.state?.newUser;
  

  const userGroupList = location?.state?.newGroup;
  const [filteredChatList, setFilteredChatList] = useState([]);
  const [filteredGroupList, setFilteredGroupList] = useState([]);
  const [notification,setNotification] = useState([]);
  const [totalNotification, setTotalNotification] = useState(0);


  
  const stateRef = useRef({chatRooms, totalNotification, filteredChatList, selectedRoom});





  useEffect(() => {
    stateRef.current = {chatRooms, totalNotification, filteredChatList, selectedRoom};
  },[chatRooms, totalNotification, filteredChatList, selectedRoom])

  const createChatrooms = async (room) => {
    console.log(room);
    setchatRooms((prev) => [...prev, room])
  };

  const getChatRoom = async (userId) => {

    try {
        const response = await fetch('http://localhost:5000/api/getChatRoom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        
        if (data.length > 0) {
          // const uniqueUsers = {};
          // data.forEach((msg) => {
          //   const userId = msg.from_user_id;

          //   // Skip if already added
          //   if (!uniqueUsers[userId]) {
          //     uniqueUsers[userId] = {
          //       id: chatRooms.id,         // or userId if more logical
          //       name: userId.name,
          //     };
          //   }
          // });

          // Object.values(uniqueUsers).forEach((userInfo) => {
          //   createChatRooms(userInfo);
          // });
          data.forEach((chatroom) => {
            createChatrooms(chatroom);
          })
          setFilteredChatList(data.filter(room => { 
            return room.is_group === false;
          }));
          console.log(filteredChatList);
          setFilteredGroupList(data.filter(room => {    
            return room.is_group === 'true';
          }));
          
        }

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
    } catch (error) {
        alert(`Login failed: ${error.message}`);
    }
  };

  const getChatroomNotification = async (userId) => {
    try {
      const response = await fetch('http://localhost:5000/api/getChatroomNotification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({userId}),
      });

      const data = await response.json();
      let noti = 0;
      




      data.forEach((room) => {
        setNotification((prev) =>[...prev, room]);
        noti += room.count;
      });

      roomNotificationRefChange(noti);
      

    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  }


    // Re-init Preline when buttons render
  useEffect(() => {
    import('preline').then(({ HSOverlay }) => {
      HSOverlay?.autoInit();
    });
  });

  

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


        getChatRoom(data.userId);
        getChatroomNotification(data.userId);
        } catch (err) {
        console.error("Not authenticated");
        }
    };

    getUser();
    
  },[]);

  useEffect(() => {
    if (userFriendList && Object.keys(userFriendList).length > 0) {
      
      createChatrooms(userFriendList);
      setSelectedRoom(userFriendList);
    }
  },[userFriendList])

  useEffect(() => {
    if (userGroupList && Object.keys(userGroupList).length > 0) {
      
      
      setSelectedRoom(userGroupList);
    }
  },[userGroupList])



  

  useEffect(() => {
    
    if (selectedUserModal && Object.keys(selectedUserModal).length > 0) {
      const chatroomExist = ( chatRooms.some(room => room.user_id === selectedUserModal.id) || chatRooms.some(room => room.id === selectedUserModal.id) );
      if (!chatroomExist) {
        createChatrooms(selectedUserModal);
      }
      setSelectedRoom(selectedUserModal);      
    }

    prevModalRef.current = selectedUserModal;
  },[selectedUserModal])


  useEffect(() => {
    
    if (selectedGroupModal && Object.keys(selectedGroupModal).length > 0) {
      const chatroomExist = ( chatRooms.some(room => room.user_id === selectedGroupModal.id) || chatRooms.some(room => room.id === selectedGroupModal.id) );
      if (!chatroomExist) {
        createChatrooms(selectedGroupModal);
      }
      setSelectedRoom(selectedGroupModal);      
    }

    prevModalRef.current = selectedGroupModal;
  },[selectedGroupModal])
  

  const handleMessageChatroom = (user) => {
    createChatrooms(user);
    HSOverlay.close('#hs-basic-modal');    
  }

  const handleSelectRoom = (room) => {
    let noticount = {};
    setSelectedRoom(room);

    // reset notification count for this room
    
    setNotification((prev) => {
      
      return prev.map(n => n.id === room.chatroom_id ? {...n, count: 0} : n);

    });
    

  };

  const handleOpenGroupSetting = (room) => {
    setGroupSetting(true);
  }

  const handleCloseGroupSetting = (room) => {
    setGroupSetting(false);
  }

    useEffect(() => {
      const { chatroomid, name, content} = broadcastingChatNotification;
        if (stateRef.current.selectedRoom?.chatroom_id !== chatroomid) {
          if (stateRef.current.chatRooms.some(room => room.chatroom_id === chatroomid)) {
            setNotification((prev) => {
              const existing = prev.find(n => n.id === chatroomid);
              
              if (existing) {
                return prev.map(n => n.id === chatroomid ? {...n, count: n.count + 1} : n);                  
              } else {
                return [...prev, {id:chatroomid, count: 1}];
              } 
            });
          } else {
            const newRoom ={chatroom_id: chatroomid, chatroom_name: name, user_type: 'private' }
            createChatrooms(newRoom);
            setNotification((prev) => {
              const existing = prev.find(n => n.id === chatroomid);
              
              if (existing) {
                return prev.map(n => n.id === chatroomid ? {...n, count: n.count + 1} : n);                  
              } else {
                return [...prev, {id:chatroomid, count: 1}];
              } 
            });
          }
        }
    },[broadcastingChatNotification])



  return (
    <>

          <div data-hs-layout-splitter-item="30.0" class="flex-1 bg-gray-200">
            <div class="flex flex-col h-full">
              {/* Left Side: Chat List */}
              <ChatListBar onSelectChatListType={setChatListType} />
              <div id="bar-with-underline-1" class="overflow-y-auto" role="tabpanel" aria-labelledby="bar-with-underline-item-1">
                <ChatList
                  chatRooms={chatRooms}
                  selectedRoom={selectedRoom}
                  onSelectRoom={handleSelectRoom}
                  notification={notification}
                />
              </div>
              <div id="bar-with-underline-2" class="hidden" role="tabpanel" aria-labelledby="bar-with-underline-item-2">
                <ChatList
                  chatRooms={filteredChatList}
                  selectedRoom={selectedRoom}
                  onSelectRoom={setSelectedRoom}
                />
              </div>
              <div id="bar-with-underline-3" class="hidden" role="tabpanel" aria-labelledby="bar-with-underline-item-3">
                <ChatList
                  chatRooms={filteredGroupList}
                  selectedRoom={selectedRoom}
                  onSelectRoom={setSelectedRoom}
                />
              </div>
            </div>
          </div>

          <div data-hs-layout-splitter-item="70.0" class="relative flex-1 bg-gray-100">
            {/* Right Side: Chat Room */}
            {selectedRoom && (
              <ChatRoom
                key={selectedRoom.id}
                room={selectedRoom}
                notificationMessage={broadcastingChatNotification}
                onOpenGroupSetting={handleOpenGroupSetting}
              />
            )}

            { groupSetting && <GroupChatSetting room={selectedRoom} onCloseGroupSetting={handleCloseGroupSetting}  /> }
          </div>

      
        

    </>
    
  );
})

export default Home;
