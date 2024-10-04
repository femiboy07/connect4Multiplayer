import React, { useEffect } from "react";




export default function Cell({ cellRef, onMouseHovers, value, onClick, celler, onMouseRemove }: { celler: any, onMouseHovers: any, cellRef: any, value: number, onClick: Function, onMouseRemove: any }) {


  console.log(value)
  const color = value === 1 ? (
    <div className="md:player1-large  player1-small  " data-placed={false}></div>
  ) : value === 2 && (
    <div className="md:player2-large  player2-small  " data-placed={false}></div>
  )





  function handleClick() {
    onClick();
    console.log(celler)
  }



  return (
    <div className={`md:pl-[0.57rem] pl-[0.1rem] flex cursor-pointer z-[1] ${value === 0 ? 'z-[2]' : 'z-[1]'}  order-1  relative `} onMouseOver={onMouseHovers} onMouseLeave={onMouseRemove} onClick={handleClick} ref={cellRef}>
      {color}
    </div>
  )
}