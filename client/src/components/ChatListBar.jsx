import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Sidebar buttons
const ChatListBar = () => {

  useEffect(() => {
    window.HSStaticMethods.autoInit();
  }, []);

  return (
    <nav class="relative z-0 flex border border-gray-200 overflow-hidden" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
    <button type="button" class="hs-tab-active:border-b-blue-600 hs-tab-active:text-gray-900 relative min-w-0 flex-1 bg-gray-200 first:border-s-0 border-s border-b-2 border-gray-200 py-4 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium text-center overflow-hidden hover:bg-gray-50 focus:z-10 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none active" id="bar-with-underline-item-1" aria-selected="true" data-hs-tab="#bar-with-underline-1" aria-controls="bar-with-underline-1" role="tab">
      All
    </button>
    <button type="button" class="hs-tab-active:border-b-blue-600 hs-tab-active:text-gray-900 relative min-w-0 flex-1 bg-gray-200 first:border-s-0 border-s border-b-2 border-gray-200 py-4 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium text-center overflow-hidden hover:bg-gray-50 focus:z-10 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none" id="bar-with-underline-item-2" aria-selected="false" data-hs-tab="#bar-with-underline-2" aria-controls="bar-with-underline-2" role="tab">
      Chat
    </button>
    <button type="button" class="hs-tab-active:border-b-blue-600 hs-tab-active:text-gray-900 relative min-w-0 flex-1 bg-gray-200 first:border-s-0 border-s border-b-2 border-gray-200 py-4 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium text-center overflow-hidden hover:bg-gray-50 focus:z-10 focus:outline-hidden focus:text-blue-600 disabled:opacity-50 disabled:pointer-events-none" id="bar-with-underline-item-3" aria-selected="false" data-hs-tab="#bar-with-underline-3" aria-controls="bar-with-underline-3" role="tab">
      Group
    </button>
  </nav>
  );
};

export default ChatListBar;