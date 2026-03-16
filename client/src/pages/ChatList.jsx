import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
function ChatList({ chatRooms, selectedRoom, onSelectRoom, notification }) {
  



  return (
    <div>
      <div>
      {chatRooms.map((room) => {
        console.log(room);
        let count = 0;
        if (notification) {
          const notify = notification.find(y => y.id === room.chatroom_id);
          count = notify ? notify.count : 0;
        }
        

        
        return (
          <div class= {` ${
            (selectedRoom?.chatroom_id && selectedRoom.chatroom_id === room.chatroom_id) || (selectedRoom?.id && selectedRoom.id === room.id) ? "bg-purple-800" : "hover:bg-gray-300"
          } flex flex-row items-center`} onClick={() => onSelectRoom(room)}>
        <div
          key={room.id}
          className= {`chat-list-item ${
            selectedRoom?.chatroom_id === room.chatroom_id ? "font-medium text-white" : ""
          } py-3 px-4 items-center gap-x-2 text-sm  border border-transparent  text-black focus:outline-hidden focus:bg-blue-100 focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none`}
          >


          {room.chatroom_name}
        </div>
        {count > 1 && (
          <div className="flex justify-center h-6 w-6 rounded-full bg-red-500">
            {count}
          </div>
        )}
        </div>
      )})}
      
      </div>
    </div>
  );
}

export default ChatList;
