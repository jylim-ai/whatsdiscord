import React, { useState, useEffect, useRef } from "react";
import UserModal from "./UserModal";

const SearchBar = ({onUser}) => {

  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [showResults, setShowResults] = useState(false);


  const wrapperRefA = useRef(null);
  const wrapperRefB = useRef(null);

  const getUsers = async (query) => {
    if (query != "") {
      try {
        const res = await fetch("http://localhost:5000/api/getUserFriend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ search: query })
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUserQuery(data);
      } catch (err) {
        console.error("REST fetch failed:", err);
        return [];
      }
    }else {
      setUserQuery([]);
    }
  };  


  // ✅ Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRefA.current && wrapperRefB.current && !wrapperRefA.current.contains(event.target) && !wrapperRefB.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
      // simulate filtered results
      getUsers(newQuery);
      setShowResults(true);
  };



  
  const handleSearchClick = () => {
      setShowResults(true);
  };

  const handleGroupModal = () => {
    HSOverlay.open('#hs-basic-modal');
    setShowResults(false);
  }

  const handleButtonClick = () => {
    
    setShowResults(false);
  }
  

  return (
    <div class="relative py-2 max-w-m h-min bg-purple-900">
      <div class="flex justify-center">
        <input ref={wrapperRefA} class="py-1.5 sm:py-2 px-5 block w-7/12 border-gray-200 text-black rounded-full sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="Input text"
          type="text"
          value={query}
          onClick={handleSearchClick}
          onChange={handleChange}
        />


        {showResults && <div ref={wrapperRefB} class={`z-16 absolute top-full mt-1 w-7/12 justify-center max-h-[calc(6*2rem)] overflow-y-scroll bg-gray-100 shadow-lg border rounded`}>
          

          <button className="py-3 px-4 w-full text-sm font-medium rounded-lg border border-transparent text-black hover:bg-blue-100 hover:text-black focus:outline-hidden focus:bg-blue-100 focus:text-blue-800" onClick={handleButtonClick}>Create a new Message</button>
          <button className="py-3 px-4 w-full text-sm font-medium rounded-lg border border-transparent text-black hover:bg-blue-100 hover:text-black focus:outline-hidden focus:bg-blue-100 focus:text-blue-800" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-basic-modal" data-hs-overlay="#hs-basic-modal" onClick={handleGroupModal}>Create a new Group</button>
          <span className="p-4 text-gray-500 text-sm font-medium">SEARCH</span>
          {userQuery.length > 0 ? (
            userQuery.map((user) => (
              <button
                key={user.id}
                onClick={() => {onUser(user)}}
                type="button"
                className="py-3 px-4 w-full text-sm font-medium rounded-lg border border-transparent text-black hover:bg-blue-100 hover:text-black focus:outline-hidden focus:bg-blue-100 focus:text-blue-800"
                data-hs-overlay="#hs-basic-modal"
              >
                {user.name}
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-500 text-sm">No users found.</div>
          )}
        </div> }

      </div> 
      
      
          

          

        




    </div>

    
    
    
  );
};



export default SearchBar;
