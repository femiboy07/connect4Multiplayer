import React from 'react'

function ModalConnection() {
  return (
    <>
     <div className={`w-full h-full bg-slate-800 bg-opacity-70 fixed z-[145555] top-0 left-0 right-0 bottom-0`}></div>
    <div className='w-full h-full flex justify-center  absolute z-[9999999999999] items-center'>
       <div className='w-fit flex flex-col text-center p-5 bg-white'>
         <span>Connection lost</span>
         <span>Attempting to reconnect</span>
       </div>
    </div>
    </>
  )
}

export default ModalConnection
