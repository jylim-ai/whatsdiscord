import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { House } from 'lucide-react';
import { Users } from 'lucide-react';


const Sidebar = ({messageCount, friendCount}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === '/ChatApp';
    const isFriendListPage = location.pathname === '/ChatApp/FriendList';
    const isProfilePage = location.pathname === '/ChatApp/Profile';
    
    const handleNavigateSignup = async () => {
        navigate('')
    }




    const handleNavigateProfile = async () => {
        navigate('Profile')
    }


    
    const handleNavigateFriendList = async () => {
        navigate('FriendList')
    }

    useEffect(() => {
    window.HSStaticMethods.autoInit();
  }, []);



    return(

    <div id="hs-sidebar-mini-sidebar" class="hs-overlay block translate-x-0 end-auto bottom-0 w-20 hs-overlay-open:translate-x-0-translate-x-full transition-all duration-300 transform top-0 start-0 z-60 bg-purple-900" role="dialog" tabindex="-1" aria-label="Sidebar">
      
      <div class="flex flex-col justify-between items-center h-full">
        <div class="flex flex-col justify-center items-center gap-y-2">
          
          <div class="hs-tooltip relative [--placement:right] inline-block">
            <a onClick={handleNavigateSignup} class= {`hs-tooltip-toggle size-9.5 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none ${isHomePage ? 'bg-white text-purple-900' : 'text-white hover:bg-purple-700'}`}>
              <House size={21} strokeWidth={2.75} />
              <span class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 inline-block absolute invisible z-20 py-1.5 px-2.5 bg-gray-900 text-xs text-white rounded-lg whitespace-nowrap" role="tooltip">
                Home
              </span>
               <span class="absolute -bottom-1 -right-1 rounded-full bg-purple-300 text-purple-900 text-[10px] px-1 z-50">
      {messageCount}
    </span>
            </a>
          </div>
          

          
          <div class="hs-tooltip relative [--placement:right] inline-block">
            <a onClick={handleNavigateFriendList} class= {`hs-tooltip-toggle size-9.5 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" ${isFriendListPage ? 'bg-white text-purple-900' : 'text-white hover:bg-purple-700'}`}>
              <Users size={21} strokeWidth={2.75}/>
              <span class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 inline-block absolute invisible z-20 py-1.5 px-2.5 bg-gray-900 text-xs text-white rounded-lg whitespace-nowrap dark:bg-neutral-900" role="tooltip">
                Users
              </span>
              <span class="absolute -bottom-1 -right-1 rounded-full bg-purple-300 text-purple-900 text-[10px] px-1 z-50">
      {friendCount}
    </span>
            </a>
          </div>

        </div>

          

        <div class="flex flex-col justify-center items-center gap-y-2">
          <div class="hs-tooltip [--placement:right] inline-block">
            <a onClick={handleNavigateProfile} class="hs-tooltip-toggle size-9.5 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" href="#">
              <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/><path d="m19.6 18.7-.4-1"/><path d="m16.8 12.3-.4-1"/><path d="m14.3 16.6 1-.4"/><path d="m20.7 13.8 1-.4"/></svg>
              <span class="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 inline-block absolute invisible z-20 py-1.5 px-2.5 bg-gray-900 text-xs text-white rounded-lg whitespace-nowrap dark:bg-neutral-900" role="tooltip">
                Account
              </span>
            </a>
          </div>
        </div>
      </div>

        

</div>
    )
};

export default Sidebar;
