import React, { SetStateAction, useEffect, useState } from 'react';
import './App.css';
import ModalInput from './components/Modal';
import { Menu } from './Screen/Menu';
import { useSocket } from './SocketContext';
import RoomPage from './Screen/RoomPage';
import { useManageRoomContext } from './components/Context/MangaeRoomSocket';

function App() {
  const [data, setData] = useState(null);
  const [isModal, setIsModal] = useState<boolean>(true);
  const socket = useSocket();
  const { setRoomId } = useManageRoomContext()


  useEffect(() => {
    console.log('connected', "connect")
    socket.on('welcome_message', (data) => {
      console.log(data)
      setData(data)
    })
    socket.on('meet', (data) => {
      console.log(data)
    })

    socket.emit('welcome', '1111111111111111');

    return () => {
      socket.on('disconnect', () => {
        console.log('disconnecteds');
        setRoomId(null)
      })
    }


  }, [socket])


  console.log(data)
  return (
    <>
      <div className={`w-full h-full bg-slate-800 bg-opacity-70 fixed z-[145] top-0 left-0 right-0 bottom-0`}></div>
      <div className="bg-blue-600 w-full min-h-screen overflow-y-auto">
        <div className='w-full flex justify-center h-screen items-center'>
          {isModal && <Menu isModal={isModal} setIsModal={setIsModal} />}

        </div>
      </div>
    </>
  );
}

export default App;
