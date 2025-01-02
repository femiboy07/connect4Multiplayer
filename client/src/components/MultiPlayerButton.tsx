import React, { SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../SocketContext';




export default function MultiPlayerButton({ setIsModal }: { isModal: boolean, setIsModal: React.Dispatch<SetStateAction<boolean>> }) {

   const uuid = uuidv4()
   const navigate = useNavigate();
   const socket = useSocket();



   function initiateOnlineGame() {
      socket.emit('init_game');
      navigate(`/r/${uuid}`, { replace: true });
   }


   return (
      <button onClick={initiateOnlineGame} className='px-3 py-2 border bg-blue-400  rounded-md '>
         <span className='text-white font-bold '>Find Player</span>
      </button>
   )
}