import React, { createContext, SetStateAction, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Replace with your server URL
const port = process.env.REACT_APP_WEBSOCKET_URL || "ws://localhost:3000";
const protocol = port.startsWith('https') ? 'wss' : 'ws';
export const sockerServerUrl = port.replace(/^http/, protocol);


// Create a context for the socket

export const socket =io(sockerServerUrl,{
    transports:['websockets']
})

 export const SocketContext = createContext<Socket | null>(socket);


export function useSocket():Socket {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
