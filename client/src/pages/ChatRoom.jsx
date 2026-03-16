import React, { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { io } from "socket.io-client";
import { useLocation } from 'react-router-dom';
import { socket } from '../socket';
import { v4 as uuidv4 } from 'uuid';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

function ChatRoom({ room, notificationMessage, onOpenGroupSetting }) {
  const [messages, setMessages] = useState([]);
  const [user, setUser]  = useState([]);
  const [aiReplyLoading, setAIReplyLoading] = useState(false);
  const [aiReply, setAIReply] = useState("");

  const location = useLocation();


  


  const getAIReply = async (room, user) => {
    setAIReplyLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/getAIReply", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({room, user})
      });
      const data = await res.json();
      setAIReply(data);
      setAIReplyLoading(false);
    } catch (err) {
      console.error("REST send failed:", err);
    }
  }
  
  useEffect(()=> {
    const getUser = async () => {
        try {
        const res = await fetch("http://localhost:5000/api/user", {
          method: 'GET',
          credentials: 'include', // this sends the cookie back to server
        });

        const data = await res.json();
        setUser(data);



        } catch (err) {
        console.error("Not authenticated");
        }
    };

    getUser();
    
  },[]);

  

  
  
  useEffect(() => {
  const getMessage = async (room) => {
    try {
      const res = await fetch("http://localhost:5000/api/getMessage", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({room})
      });
      const data = await res.json();
      setMessages(data); 
    } catch (err) {
      console.error("REST send failed:", err);
    }
  }
  getMessage(room.chatroom_id); 
  }, [room]);




    

    useEffect(() => {
      if (notificationMessage) {
        const { chatroomid, id, content, name } = notificationMessage;
        if (room.chatroom_id === chatroomid) {
          setMessages((prev) => [...prev, { id:id, name:name, content:content}]);
        }
      } 
      
    }, [notificationMessage, room]);

  const handleSend = async (content) => {
    
    const tempId = uuidv4();

    const newMsg = {
      id: tempId,
      content: content,
      fromId: user.userId,
      name: user.userName,
      toId: room.id,
      chatroomId: room.chatroom_id,
      timestamp: new Date().toLocaleTimeString(),
    };
    

      setMessages((prevMessages) => [...prevMessages, newMsg]);
      socket.emit("chat message:send", newMsg);

  };

  useEffect(() => {
    socket.on("chat message:notifysend", (msg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.tempId
            ? { ...msg } // replace temporary one
            : m
        )
      );
    })
  },[])

  useEffect(() => {
    if (room == {} || user == {}) return; // safety check

    socket.emit("chat message:read", {
      roomId: room.chatroom_id,
      userId: user.userId,
    });
  }, [room,user,messages]);

  useEffect(() => {
      import('preline').then(({ HSDropdown }) => {
        HSDropdown?.autoInit();
      });
    });

    const handleDeleteMessage = async (message) => {
      try {
        const res = await fetch("http://localhost:5000/api/deleteMessage", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({message})
        });
        const data = await res.json();
        if (data) {
          Toastify({
            text: "This is a toast",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            
            }).showToast();
        }
      } catch (err) {
        console.error("REST send failed:", err);
      }
    }

    

  return (
      <div className="flex flex-col h-full">
        {room.user_type === 'admin' && (
          <div class="border-b-2 p-3 text-black group" onClick={() => onOpenGroupSetting(room)}>
            <h3>{room.chatroom_name}</h3>
            
              <span className="opacity-0 group-hover:opacity-100">
                Click to edit
              </span>
          </div>
        )}
        {room.user_type === 'member' && (
          <div class="border-b-2 p-3 text-black group" onClick={() => onOpenGroupSetting(room)}>
            <h3>{room.chatroom_name}</h3>
            
              <span className="opacity-0 group-hover:opacity-100">
                Click to view
              </span>
          </div>
        )}
        {room.user_type === 'private' && (
          <div class="border-b-2 p-3 text-black group" onClick={() => onOpenGroupSetting(room)}>
            <h3>{room.chatroom_name}</h3>
            

          </div>
        )}


          
          
        
        
        <div class="flex-1 overflow-y-auto">
          <MessageList messages={messages} onDeleteMessage = {handleDeleteMessage} />
          
        </div>
        <div>
          <MessageInput onSend={handleSend} onAISubmit={() => getAIReply(room.chatroom_id,user.userId)} aitext={aiReplyLoading} aiput={aiReply} />
        </div>

        <div id="hs-basic-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1" aria-labelledby="hs-basic-modal-label">
  <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
    <div class="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
      <div class="flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-neutral-700">
        <h3 id="hs-basic-modal-label" class="font-bold text-gray-800 dark:text-white">
          Modal title
        </h3>
        <button type="button" class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600" aria-label="Close" data-hs-overlay="#hs-basic-modal">
          <span class="sr-only">Close</span>
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-4 overflow-y-auto">
        <p class="mt-1 text-gray-800 dark:text-neutral-400">
          This is a wider card with supporting text below as a natural lead-in to additional content.
        </p>
      </div>
      <div class="flex justify-end items-center gap-x-2 py-3 px-4 border-t border-gray-200 dark:border-neutral-700">
        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" data-hs-overlay="#hs-basic-modal">
          Close
        </button>
        <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
          Save changes
        </button>
      </div>
    </div>
  </div>
</div>
        
        
      </div>
    
  );
}

export default ChatRoom;
