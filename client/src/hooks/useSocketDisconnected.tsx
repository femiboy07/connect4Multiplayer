import React, { useEffect, useState } from 'react';
import { useSocket } from '../SocketContext';
import { useNavigate } from 'react-router-dom';




export const useSocketDisconnected = () => {

   const [online, setOnline] = useState(navigator.onLine);
   const socket = useSocket();
   const navigate = useNavigate()

   useEffect(() => {
      const handleConnectionOff = () => {
         setOnline(false)


      }

      const handleConnectionOn = () => {
         setOnline(true);
         socket.connect()
         navigate('/', { replace: true })

      }
      window.addEventListener('offline', handleConnectionOff);
      window.addEventListener('online', handleConnectionOn);


      return () => {
         window.removeEventListener('offline', handleConnectionOff);
         window.removeEventListener('online', handleConnectionOn);

      }
   }, [navigate, socket])

   return online
}