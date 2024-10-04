import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../SocketContext'
import { replace, useNavigate } from 'react-router-dom';

export default function ModalWinner({ roomId, setWinner, won, playerLeft, winner, setPlayerLeft, setToast, setToastMessage }: { roomId: string, setWinner: any, setToast: any, setToastMessage: any, won: string, playerLeft: boolean, setPlayerLeft: any, winner: boolean }) {
  const socket = useSocket();
  const [reply, setReply] = useState(false);
  const [rejected, setRejected] = useState(false)
  const [value, setValue] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [maximize, setMaximize] = useState(false)
  const [storedCallback, setStoredCallback] = useState<any>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [count, setCount] = useState<number>(10);
  const navigate = useNavigate();
  const maximizeRef = useRef<HTMLButtonElement | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);

  function rematch() {
    if (playerLeft) {
      setMessage('opponent left the game')
    } else {
      setLoading(true)
      setMessage('Waiting for the other player to accept the rematch...')
      console.log('Waiting for the other player to accept the rematch...');
      socket.emit('rematchRequest', { roomId }, (response: { status: string }) => {
        if (response.status === 'accepted') {
          setLoading(false)
          console.log(response.status)
          setMessage('Rematch accepted! Starting new game...')
          console.log('Rematch accepted! Starting new game...');
        } else if (response.status === 'rejected') {
          console.log('Rematch rejected by the other player.');
        } else if (!response) { }
        setMessage('opponent left the game')
      });
    }
  }





  const valueRef = useRef(value); // Reference to track the latest value

  // Keep the reference up to date with the latest value
  const handleValueChange = (newValue: string) => {
    valueRef.current = newValue; // Update the ref directly
    console.log('New value:', newValue); // Log the new value to check it's updated

    // Call the stored callback with the latest value
    if (storedCallback) {
      storedCallback({ status: valueRef.current });
      setStoredCallback(null); // Clear the stored callback after it's used
    }
  };

  const leaveRoom = useCallback(() => {
    // Emit leaveRoom event with a callback for acknowledgment
    socket.emit('leaveRoom', roomId)

  }, [roomId, socket]);

  useEffect(() => {
    if (playerLeft || winner || won) {
      leaveTimerRef.current = setInterval(() => {
        if (count > 0) {
          setCount((prev) => prev - 1)
        }
      }, 1000);
      if (count === 0) {
        clearInterval(leaveTimerRef.current);
        leaveRoom()
        // navigate('/', { replace: true })
      }



    }

    return () => {
      if (leaveTimerRef.current) {
        clearInterval(leaveTimerRef.current)
      }
    }
  }, [count, playerLeft, roomId, socket, navigate, leaveRoom, winner, won])






  useEffect(() => {
    socket.on('rematchRequest', (data, callback) => {
      setReply(true); // Show rematch options in UI

      // Call the callback to send the response back to the server
      setStoredCallback(() => callback);
      //  await callback({ status: currentValue });
    });

    socket.on('rejectedMatch', (data) => {
      setLoading(false);
      setMessage(data);
      setRejected(true)
      setReply(false)
    })

    socket.on('playerLeft', (data) => {
      setReply(false)
      setToast(true)
      setToastMessage(data);
      setPlayerLeft(true);
    })

    socket.on('leaveRoomResponse', (data) => {
      navigate('/', { replace: true })
    })



    socket.on('rematchAccepted', (data) => {
      console.log(data.message);
      setLoading(false);
      setMessage(data.message);

      // After showing the message, reset winner state and navigate
      setWinner(false)
      navigate(`/r/${roomId}`);

    });
    socket.on('opponent_left', (data) => {
      console.log(data)
      setLoading(false)
      setOpponentLeft(true)
      setMessage(data)
    });

    // Clean up socket event listeners when the component unmounts
    return () => {
      socket.off('rematchRequest');
      socket.off('rematchAccepted');
      socket.off('rejectedMatch');
      socket.off('opponent_left');
      socket.off('playerLeft');
      socket.off('leaveRoomResponse')

    };
  }, [socket, roomId, navigate, setWinner, setToast, setToastMessage, setPlayerLeft]);


  console.log(value)

  return (
    <>
      <div className={`w-full h-full bg-slate-800 bg-opacity-70 fixed z-[145] top-0 left-0 right-0 bottom-0`}></div>
      <div className={`w-full h-screen transition-all ease-in-out delay-100 duration-1000  flex fixed z-[245] top-0 left-0 right-0 bottom-0 flex-col items-center`}>
        <div className={`bg-white rounded-md shadow-2xl  delay-100 duration-950 transition-all ease-in-out  ${maximize ? ' h-14 overflow-hidden  top-1/2 translate-y-1/2  flex items-center overflow-y-hidden  ' : ' h-64 translate-y-[50%]   flex self-center py-4  overflow-y-hidden '} shadow-md flex  py-2 px-2  flex-col max-w-md w-full `}>
          <div className=' header  w-full  flex justify-between  items-center '>
            <h1>Game End</h1>
            <button ref={maximizeRef} onClick={() => setMaximize(!maximize)} className='bg-transparent py-2 px-3'>{!maximize ? 'minimize' : 'maximize'}</button>
          </div>
          <div className={`text-center  flex-col ${maximize ? 'hidden' : 'flex'} `}>
            <h1>{won}</h1>
            {!rejected && <button onClick={rematch} className='px-3 py-2 bg-blue-600  rounded-md text-white'>Rematch</button>}
            {loading && !opponentLeft && <>Loading...</>}
            <p>{message}</p>
            {reply &&
              <div className='flex  mt-2 items-center gap-2 mx-auto justify-center w-full text-center'>
                <button onClick={() => handleValueChange('accepted')} className='bg-blue-600 px-4 py-2 text-white'>accepted</button>
                <button onClick={() => handleValueChange('rejected')} className='bg-blue-600 px-4 py-2 text-white'>rejected</button>
              </div>}
            {<button onClick={() => leaveRoom()} className='bg-blue-600 px-4 py-2 mt-2 text-white'>leaveRoom {(playerLeft || winner || won) ? count : ''}</button>}
            {rejected && <button className='bg-blue-600 px-4 py-2 text-white' onClick={() => navigate('/')}>Menu</button>}
          </div>
        </div>
      </div>
    </>
  )
}

