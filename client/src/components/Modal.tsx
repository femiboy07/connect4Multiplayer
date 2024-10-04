import React, { useState } from "react"

import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from "../SocketContext";
import { useGameContext } from "../GameContext";
import { usePreloadedSound } from "./Context/usePreloadedSound";


export default function ModalInput() {
  const [value, setValue] = useState('');
  const { isClick, setIsClick } = useGameContext()
  const uuid = uuidv4();
  const navigate = useNavigate();
  const socket = useSocket();
  const { preloadedSound, sounds } = usePreloadedSound()

  function StartGame() {
    preloadedSound()
    socket.emit('init_game', { name: value, score: 0, roomId: uuid })
    localStorage.setItem('name', value)
    setIsClick(true);
    navigate(`/r/${uuid}`);
  }



  return (
    <>
      <div className='w-full h-full bg-slate-800 bg-opacity-70 fixed z-10 top-0 left-0 right-0 bottom-0'></div>
      <div className='w-full h-full flex justify-center fixed z-20 top-0 left-0 right-0 bottom-0 flex-col items-center'>
        <div className='bg-white h-fit  max-w-md w-full  items-center  flex flex-col '>
          <div className=' header px-3 py-4 w-full flex justify-between '>
            <h1>Who are you</h1>
            <div>x</div>
          </div>
          <hr className="w-full" />
          <div className='body  h-24 w-full flex items-center justify-center'>
            <div>
              <input onChange={(e) => setValue(e.target.value)} className='w-full px-10 border-none bg-slate-400 bg-opacity-20 placeholder:opacity-100 text-black py-6 outline-none text-center border' placeholder='Nickname' />
            </div>
          </div>
          <hr className="w-full" />
          <div className='footer flex w-full justify-end py-4 items-center px-3 '>
            <button className='self-center bg-slate-800 px-4 py-1 rounded-md text-white' onClick={StartGame}>continue</button>
          </div>
        </div>
      </div>
    </>
  )
}