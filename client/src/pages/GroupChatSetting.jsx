import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from 'lucide-react';
import { HSSelect } from "preline";
import { Pencil } from 'lucide-react';
import { Check } from 'lucide-react';

function GroupChatSetting({room, onCloseGroupSetting}) {
    

    const [groupName,setGroupName] = useState(room.chatroom_name);
    const [modifyGroupName, setModifyGroupName] = useState(false);
    
    const [groupMember, setGroupMember] = useState([]);
    const [nextGroupMemberIdCursor, setNextGroupMemberIdCursor] = useState([]);
    const [groupMemberQuery, setGroupMemberQuery] = useState([]);
    const [hasGroupMemberMore, setHasGroupMemberMore] = useState([]);
    const [selectedRemoveGroupMember, setSelectedRemoveGroupMember] = useState([]);
    const [selectedCreateGroupMember, setSelectedCreateGroupMember] = useState([]);

    const stateRef = useRef ({groupMemberQuery, nextGroupMemberIdCursor, hasGroupMemberMore});



    useEffect(() => {
        stateRef.current = {groupMemberQuery, nextGroupMemberIdCursor, hasGroupMemberMore}
    },[groupMemberQuery, nextGroupMemberIdCursor, hasGroupMemberMore])
    

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from reloading
        handleCreateGroup();

    }




    
    const handleModifyGroupName = async (room, groupName) => {
          try {

              const res = await fetch("http://localhost:5000/api/editGroup", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ room, groupName })
              });                
              if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setGroupName(groupName)
                    setModifyGroupName(false)
                }
            } else {
                console.error('Failed to send request');
            }
                    

          } catch (err) {
              console.error("REST fetch failed:", err);
              return [];
          }

          
    };

    const handleGetGroupMember = async (query = "", room , cursor = "" ) => {


        if (!cursor) {
            setGroupMember([]);
        }


        try {
            const params = new URLSearchParams({
            limit: 10,
            search: query,
            rm: room
            });
            if (cursor) {
            params.append('nextIdCursor', cursor);
            }

            const res = await fetch(`/api/getUserGroupMember?${params.toString()}`);
            const data = await res.json();

            setGroupMember((prev) => [...prev, ...data.members]);
            setNextGroupMemberIdCursor(data.nextCursor.id); // <- triggers useEffect to update ref
            setHasGroupMemberMore(data.hasMore);
        } catch (err) {
            console.error(err);
        } 
        };

    const handleRemoveGroupMember = async (room, user) => {
          try {

              const res = await fetch("http://localhost:5000/api/deleteGroupMember", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ room, user })
              });                
              if (res.ok) {
                const data = await res.json();
                if (data) {
                    groupMember.map(member => member.user_id == data.user_id ? {...member, user_type: null} : member)
                }
            } else {
                console.error('Failed to send request');
            }
                    

          } catch (err) {
              console.error("REST fetch failed:", err);
              return [];
          }

          
    };

    const handleCreateGroupMember = async (room, user) => {
          try {

              const res = await fetch("http://localhost:5000/api/createGroupMember", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ room, user })
              });                
              if (res.ok) {
                const data = await res.json();
                if (data) {
                    groupMember.map(member => member.user_id == data.user ? {...member, user_type: 'member'} : member)
                }
                handleCloseCreateModal();
            } else {
                console.error('Failed to send request');
            }
                    

          } catch (err) {
              console.error("REST fetch failed:", err);
              return [];
          }

          
    };

    useEffect(() => {
        handleGetGroupMember(groupMemberQuery, room.chatroom_id);
    },[groupMemberQuery])

    const observer = useRef();
    const lastMemberRef = useCallback(
    (node) => {


        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && stateRef.current.hasGroupMemberMore) {
            handleGetGroupMember(stateRef.current.groupMemberQuery, room.chatroom_id, stateRef.current.nextGroupMemberIdCursor);
        }
        });

        if (node) observer.current.observe(node);
    },
    [hasGroupMemberMore]
    );

    useEffect(() => {
        import('preline').then(({ HSOverlay }) => {
        HSOverlay?.autoInit();
        });
    });

    const handleOpenRemoveModal = (user) => {
        setSelectedRemoveGroupMember(user)
        const modal = new HSOverlay(document.querySelector('#hs-remove-member-modal'))
        modal.open()
    }

    const handleCloseRemoveModal = () => {
        const modal = new HSOverlay(document.querySelector('#hs-remove-member-modal'))
        modal.close()
    }

    const handleOpenCreateModal = (user) => {
        setSelectedCreateGroupMember(user)
        const modal = new HSOverlay(document.querySelector('#hs-create-member-modal'))
        modal.open()
    }

    const handleCloseCreateModal = () => {
        const modal = new HSOverlay(document.querySelector('#hs-create-member-modal'))
        modal.close()
    }

    


    return(
        <div>
        <div class="absolute w-full flex flex-col bg-gray-100 top-0 h-full z-50">
            <div class="flex border-b-2 p-3 text-black group">
                <h3 class="flex-1">Modify Group</h3>
                <div onClick={onCloseGroupSetting}><X /></div>
            </div>
          <div class=" text-black">
  <label for="input-label" class="block text-sm font-medium mb-2">Email</label>
  {!modifyGroupName ? (
    <div class="flex justify-between">
        <p>{groupName}</p>
        {room.user_type === 'admin' && (
            <span onClick={() => setModifyGroupName(true)}><Pencil /></span>
        )}
        
    </div>
  ) : (
    <div class="flex justify-between">
        <input id="input-label" value={groupName} onChange={(e) => setGroupName(e.target.value)} class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="you@site.com" />
        <span onClick={() => handleModifyGroupName(room.chatroom_id, groupName)}><Check /></span>
    </div>
  )}
  
  
  
</div>
          <div>
            <label for="input-label" class="block text-sm font-medium mb-2 dark:text-white">Email</label>
            <div>
                <input id="input-label" value={groupMemberQuery} onChange={(e) => setGroupMemberQuery(e.target.value)} class="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="you@site.com" />
                <div class="overflow-y-auto h-96">
                {groupMember.map((user, index) => {
                    const isLast = index === groupMember.length - 1;
                    return (
                    <div
                        key={user.user_id}
                        ref={isLast ? lastMemberRef : null}
                        className="flex items-center justify-between gap-4 p-3 border-b bg-gray-500"
                    >
                        <div>{user.name}</div>
                        { user.user_type === 'member' && (
                            <div class="flex">
                                <div>{user.user_type}</div>
                                {room.user_type === 'admin' && (
                                    <button onClick={() => handleOpenRemoveModal(user)}>Remove</button>
                                )}
                                
                            </div>
                        )}
                        { user.user_type === 'admin' && (
                            <div>
                                <div>{user.user_type}</div>
                                
                            </div>
                        )}
                        { user.user_type === null && room.user_type === 'admin' && (
                            <div>
                                <button onClick={() => handleOpenCreateModal(user)}>Add</button>
                            </div>
                        )}


                        
                    </div>
                    );
                })}

                </div>
            </div>
          </div>
          <button type="submit" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-basic-modal" data-hs-overlay="#hs-basic-modal">
            Create
          </button>



        </div>

        <div id="hs-remove-member-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1" aria-labelledby="hs-remove-member-modal-label">
            <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
                <div class="flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-neutral-700">
                    <h3 id="hs-basic-modal-label" class="font-bold text-gray-800 dark:text-white">
                    Modal title
                    </h3>
                    <button type="button" onClick={handleCloseRemoveModal} class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600" aria-label="Close">
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
                    <button type="button" onClick={handleCloseRemoveModal} class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                    Close
                    </button>
                    <button type="button" onClick={() => handleCreateGroupMember(room.chatroom_id, selectedRemoveGroupMember.user_id)} class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    Confirm
                    </button>
                </div>
                </div>
            </div>
        </div>

        <div id="hs-create-member-modal" class="hs-overlay hs-overlay-open:opacity-100 hs-overlay-open:duration-500 hidden size-full fixed top-0 start-0 z-80 opacity-0 overflow-x-hidden transition-all overflow-y-auto pointer-events-none" role="dialog" tabindex="-1" aria-labelledby="hs-remove-member-modal-label">
            <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <div class="flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
                <div class="flex justify-between items-center py-3 px-4 border-b border-gray-200 dark:border-neutral-700">
                    <h3 id="hs-basic-modal-label" class="font-bold text-gray-800 dark:text-white">
                    Modal title
                    </h3>
                    <button type="button" onClick={handleCloseCreateModal} class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600" aria-label="Close">
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
                    <button type="button" onClick={handleCloseCreateModal} class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
                    Close
                    </button>
                    <button type="button" onClick={() => handleCreateGroupMember(room.chatroom_id, selectedCreateGroupMember.user_id)} class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    Confirm
                    </button>
                </div>
                </div>
            </div>
        </div>



        
        </div>
        
    )

}

export default GroupChatSetting;