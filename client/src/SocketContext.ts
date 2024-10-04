import React, { createContext, SetStateAction, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Replace with your server URL
export const sockerServerUrl = 'http://localhost:3000';

// Create a context for the socket
const clientId=localStorage.getItem('clientId')
export const socket =io(sockerServerUrl,{
    
    query:{
        clientId:clientId
    }
})

 export const SocketContext = createContext<Socket | null>(socket);


export function useSocket():Socket {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
