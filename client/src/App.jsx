import React from "react";
import Home from "./Home";
import Login from "./pages/Login";
import "./index.css";
import '../dist/output.css';
import Layout from './Layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from "./pages/Signup";
import FriendList from "./FriendList";
import Profile from "./Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/ChatApp" element={<Layout />} >
          <Route index element={<Home />} />

          <Route path="FriendList" element={<FriendList />}></Route>

          <Route path="Profile" element={<Profile />}></Route>
        </Route>
        
      </Routes>      
    </Router>
    
  )
  
}

export default App;
