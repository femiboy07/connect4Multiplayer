import React, { createRef, useEffect, useRef, useState } from 'react';
import Board from './Board';
import { useSocket } from '../SocketContext';
import { Socket } from 'socket.io-client';
import { useManageRoomContext } from './Context/MangaeRoomSocket';



export default function CreateBoard() {
  const { board, setBoard, player1, player2, currentPlayer, winner, setCurrentPlayer, roomId, gameStarted, setWinner } = useManageRoomContext()
  const [disabledCell, setDisabledCell] = useState<boolean[][]>(Array.from({ length: 6 }, () => new Array(7).fill(false)))
  const [clicked, setClicked] = useState(false)
  const clientId = localStorage.getItem('clientId')

  const socket = useSocket()
  const cellRef = useRef<HTMLDivElement[]>(new Array(42).fill(null));
  console.log(cellRef)
  const keyframes = [
    { top: '-600%', opacity: '1' },
    { top: '50%', opacity: '1' }
  ]
  const options = {
    duration: 1000,
  };






  function sendMoveMessage(column: number, board: number[][], roomId: any, currentPlayer: any) {
    console.log(column, board, "what is sent")
    socket.emit('move_disc', { column: column, board: board, roomId: roomId, currentPlayer: currentPlayer });
  }

  console.log(currentPlayer)
  function handleClick(col: number) {
    if (currentPlayer && board && player1) {
      if (socket.id !== currentPlayer.id) return;
      const updateBoard = [...board];
      const row = Math.floor(col / 7)
      const updateDisabledCell = [...disabledCell];

      let i = 5;
      while (i >= 0) {
        if (updateBoard[i][col] === 0) {
          break; // if i is equal to 0 stop input of the gameDisc
        }
        i--;
      }
      if (i < 0) {
        return //column already full
      }
      const newBoard: number[][] = updateBoard.map((row) => [...row])
      newBoard[i][col] = currentPlayer.id === player1.id ? 1 : 2;

      if (!updateDisabledCell[i]) {
        updateDisabledCell[i] = [];
      }
      updateDisabledCell[i][col] = true;

      console.log(handleCellRef(col))
      setBoard(newBoard);
      handleCellRef(col);
      setClicked(true)
      setCurrentPlayer(currentPlayer);
      setDisabledCell(disabledCell);
      console.log(player1, "ss");
      console.log(player2, 'hfhf')
      sendMoveMessage(col, newBoard, roomId, currentPlayer)
      socket.off('turn')
    }
  }



  function handleCellRef(col: number) {
    console.log('handleCellRef')
    const cell = cellRef && cellRef.current && cellRef.current[col];
    console.log(cell, 'cell');


    if (cell) {
      cell.classList.add('clicked');
      cell.classList.remove('z-10')
      cell.classList.add('z-1')
      cell.animate(keyframes, options)
    }
  }

  return (
    <>
      <Board
        cellRef={cellRef}
        onClick={handleClick}
        clicked={clicked}
      />
    </>
  )
}