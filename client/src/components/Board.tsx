import React, { RefObject, useState } from "react";
import Cell from "./Cell";
import BoardTime from "./TimeBoard";
import boardLayoutLarge from '../../src/assets/images/board-layer-black-large.svg'
import { useSocket } from "../SocketContext";
import redImage from '../assets/images/marker-red.svg';
import yellowImage from '../assets/images/marker-yellow.svg'
import { useManageRoomContext } from "./Context/MangaeRoomSocket";




export default function Board({ cellRef, onClick, clicked }: { cellRef: any, onClick: Function, clicked: boolean }) {
  const { board, setBoard, currentPlayer, player1, player2, winner, gameStarted, roomId, setCurrentPlayer } = useManageRoomContext()
  const boardStyles = 'board rounded-t-[15px] lg:max-w-lg w-full h-fit bg-white px-[10px] pb-[50px] border-x-2 rounded-bl-[35px] rounded-br-[35px] flex flex-col justify-center items-center relative z-[55] flex-wrap gap-y-[10px] border-black border-t-2 border-b-[10px]'
  console.log(board)
  const [hover, setHover] = useState(false);
  const flatenBoard: number[] | null = board && board.flat();
  const socket = useSocket();




  function OnMouseHovers(colIndex: number) {
    const gameBoard = document.querySelector('.gameboard');
    const marker = document.createElement('img');
    if (currentPlayer && player1 && player2) {
      if (socket.id === currentPlayer.id) {
        onMouseRemove(colIndex)

        marker.id = `${colIndex}`;
        marker.className = 'column_indicator_1'
        marker.src = currentPlayer.id === player1.id ? `${redImage}` : `${yellowImage}`
        const indicator = gameBoard?.children[colIndex]

        indicator?.appendChild(marker)
      } else {
        onMouseRemove(colIndex)
        marker.style.display = 'none'
      }
    }
  }

  function onMouseRemove(colIndex: number) {
    const element = document.getElementById(`${colIndex}`);
    const removeMarker = element
    if (removeMarker) {
      removeMarker.parentElement?.removeChild(removeMarker);
    }
  }

  console.log(board && board.flat())
  console.log(cellRef, 'celllllll')



  return (
    <div className=" min-h-screen items-center w-full flex justify-center pt-[3.125rem] ">
      <div className={`gameboard mt-[4rem] small-after-bg-image small-before-bg-image md:w-[39.5rem] w-[20.9375rem]   md:after-bg-image md:before-bg-image md:h-[36.5rem] mx-auto place-content-center  bg-transparent md:pb-[1.5rem] pb-[1rem] grid grid-cols-[repeat(7,2.91rem)] h-[19.375rem] grid-rows-[repeat(6,2.93rem)] md:grid-cols-[repeat(7,88px)] md:grid-rows-[repeat(6,88px)]  relative  `}>
        {flatenBoard && flatenBoard.map((cell, rowIndex) => (
          <Cell
            cellRef={(el: any) => {
              if (cellRef.current[rowIndex]) {
                cellRef.current[rowIndex] = el;
              }
            }}


            celler={cellRef}
            key={`${rowIndex}`}


            // disabledCell={disabledCell}
            onMouseHovers={() => OnMouseHovers(rowIndex % 7)}
            onMouseRemove={() => onMouseRemove(rowIndex % 7)}
            onClick={() => onClick(rowIndex % 7)} value={cell} />
        ))}
        <BoardTime
          clicked={clicked}

          onClick={onClick}

        />
      </div>



    </div>


  )
}