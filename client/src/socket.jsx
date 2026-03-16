// socket.js
import { io } from "socket.io-client";

// Create socket but don’t auto-connect yet
export const socket = io("http://localhost:5000");
