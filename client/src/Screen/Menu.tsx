import React, { SetStateAction, useEffect, useState } from "react";
import MultiPlayerButton from "../components/MultiPlayerButton";





export function Menu({ isModal, setIsModal }: { isModal: boolean, setIsModal: React.Dispatch<SetStateAction<boolean>> }) {




   return (
      <div className='max-w-sm w-full relative bg-white  text-center h-64  rounded-md z-[552]'>
         <div className="flex justify-center items-center flex-col h-full">
            <h1 className="text-2xl font-bold text-blue-400 border">Connect4 Game</h1>
            <div className=' p-5 flex justify-center  '>
               <MultiPlayerButton isModal={isModal} setIsModal={setIsModal} />
            </div>
         </div>

      </div>
   )
}