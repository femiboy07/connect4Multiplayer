import React, { createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

// Get WebSocket URL
const port = process.env.NODE_ENV === 'production' ? "https://multiplayerconnect4.onrender.com" : "http://localhost:3000";
const protocol = port.startsWith('https') ? 'wss' : 'ws';
export const sockerServerUrl = port.replace(/^http(s?):\/\//, `${protocol}://`);

// Create the WebSocket instance
export const socket = io(sockerServerUrl, {
    transports: ['websocket'], // Test removing this if issues persist
    reconnection: true // Enable automatic reconnection
});

// Create Socket Context
export const SocketContext = createContext<Socket | null>(socket);

export function useSocket(): Socket {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
