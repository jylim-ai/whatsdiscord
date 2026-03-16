import React, { useState, useEffect } from "react";

function MessageInput({ onSend, onAISubmit, aitext, aiput  }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  useEffect(() => { if (aiput) { setText(aiput); } }, [aiput]);

  return (
    <div class="border-t flex flex-row">
      <form className="w-full px-4 py-2" onSubmit={handleSubmit}>
        
        
        
        
        { aitext ? (
          
          <div class="flex">
            <input class="rounded-3xl w-9/12 text-black" type="text" disabled placeholder="AI Generating..." />
            <button class="w-3/12 flex items-center justify-center bg-green-600">
              <div class="animate-spin size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
              </div>
            </button>
            <button class="w-3/12 flex items-center justify-center bg-green-600">
              <div class="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                <span class="sr-only">Loading...</span>
              </div>
            </button>
          </div>
          ) : (

          <div class="flex">            
            <input class="rounded-3xl w-9/12 text-black" type="text"  placeholder="Type your message..." value={text} onChange={(e) => setText(e.target.value)} />
            <button class="w-3/12 bg-green-600" type="submit">Send</button>
            <button class="w-3/12 bg-green-600" onClick={
        onAISubmit}>AI</button>
          </div>


          )
        }
    </form>
    </div>
    
  );
}

export default MessageInput;
