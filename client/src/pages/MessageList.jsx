import React, {useEffect, useRef} from "react";
import { Trash } from 'lucide-react';

function MessageList({ messages, onDeleteMessage }) {

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth"});
  }, [messages]);
  



  return (
    <div className="flex-1">
      {messages.map((msg) => (
        <div key={msg.id} class="flex group p-3 text-black">
          <img
            src="/path-to-avatar.jpg"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
            />
          <div class="flex-1">
            <div>
              <div><strong>{msg.name}</strong></div>
              <div>{msg.content}</div> 
            </div>
            
            <div className="timestamp">{msg.timestamp}</div>
          </div>

          <div class="opacity-0 group-hover:opacity-100" onClick={() => onDeleteMessage(msg.id)} ><Trash /></div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
