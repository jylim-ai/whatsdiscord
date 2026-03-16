import React, { useState, useEffect, useRef } from "react";
import { X } from 'lucide-react';
import { HSSelect } from "preline";

const UserModal = ({onCreateGroup}) => {
  

  const [groupName,setGroupName] = useState("");
  const [selectedUserGroup,setSelectedUserGroup] = useState([]);

  useEffect(() => {
      import('preline').then(({ HSSelect }) => {
        HSSelect?.autoInit();
      });
      const el = window.HSSelect.getInstance('#select-user-data');
      el.on('change', (val) => {
        const values = val.map(v => Number(v));
        setSelectedUserGroup(values);
      });

    });
  
  const handleGroupModal = () => {
    HSOverlay.close('#hs-basic-modal');
  }


  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    onCreateGroup(groupName, selectedUserGroup);

  }

  

    return (
        <div>
                <div id="hs-basic-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1" aria-labelledby="hs-toggle-between-modals-second-modal-label">
  <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
    <div className="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl pointer-events-auto">
      <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200">
        <h3 id="hs-toggle-between-modals-second-modal-label" className="font-bold text-gray-800">
          
          Create a group
        </h3>
        <button type="button" onClick={handleGroupModal} className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none" aria-label="Close">
          <span className="sr-only">Close</span>
          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div class="max-w-sm mb-4">
  <label for="input-label" class="block text-sm font-medium mb-2">Group Name</label>
  <input id="input-label" value={groupName} onChange={(e) => setGroupName(e.target.value)} class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="you@site.com" />
</div>
          <div class="mb-4">
            <label for="input-label" class="block text-sm font-medium mb-2">Select members</label>
             <select id="select-user-data" multiple data-hs-select={JSON.stringify({
              "apiUrl": "http://localhost:5000/api/getSelectFriend",
               "apiSearchQueryKey": "search",
  "apiFieldsMap": {
    "id": "id",
    "val": "id",
    "title": "name"
  },
  "multiple": true,
  "placeholder": "Select multiple options...",
  "hasSearch": true,
  "searchClasses": "block w-full sm:text-sm bg-transparent border-layer-line rounded-lg text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus before:absolute before:inset-0 before:z-1 py-1.5 sm:py-2 px-3",
  "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
  "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500",
  "dropdownClasses": "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300",
  "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-hidden focus:bg-gray-100",
  "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-600 \" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>",
  "extraMarkup": "<div class=\"absolute top-1/2 end-3 -translate-y-1/2\"><svg class=\"shrink-0 size-3.5 text-gray-500 \" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div>"
})}> 
</select> 

          </div>
          <button type="submit" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-basic-modal" data-hs-overlay="#hs-basic-modal">
            Create
          </button>

        </form>
      </div>
    </div>
  </div>
</div>
            </div>
            




    )
}

export default UserModal;

