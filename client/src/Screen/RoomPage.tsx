import React, { useEffect, useState } from "react";
import { useSocket } from "../SocketContext";
import { useNavigate, useParams } from "react-router-dom";
import CreateBoard from "../components/CreateBoard";
import ModalWinner from "../components/Context/ModalWinner";
import ToastRoom from "../components/ToastRoom";
import { useSocketDisconnected } from "../hooks/useSocketDisconnected";
import ModalConnection from "../components/ModalConnection";
import { usePreloadedSound } from "../components/Context/usePreloadedSound";
import { useManageRoomContext } from "../components/Context/MangaeRoomSocket";



export default function RoomPage() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const online = useSocketDisconnected();
  const [isLoading, setLoading] = useState(false);
  const { id } = useParams();
  const [reload, setReload] = useState(false);
  const { preloadedSound, sounds } = usePreloadedSound();
  const [turn, setTurn] = useState<string | null>(null)

  const {
    playerLeft,
    setPlayerLeft,
    setLeaveRoom,
    setBoard,
    setCurrentPlayer,
    beginMessage,
    setBeginMessage,
    setGameStarted,
    gameStarted,
    setPlayer1,
    setPlayer2,
    onMount,
    setOnMount,
    winner,
    setWinner,
    toastMessage,
    setToastMessage,
    toast,
    setToast,
    roomId,
    setRoomId,
    won,
    setWon,
  } = useManageRoomContext()




  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      // Emit leaveRoom event to notify the server
      socket.emit('leaveRoom', roomId);
      e.preventDefault()

      // Perform cleanup and disconnect socket
      setGameStarted(false);
      setRoomId(null)
      navigate('/', { replace: true })


    };

    // Add the event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);


    return () => {
      // Remove the event listener when the component unmounts
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (roomId) {
        window.location.replace('/')
      }
    };
  }, [roomId, setGameStarted, socket, navigate, setRoomId]);


  useEffect(() => {
    const entries = performance.getEntriesByType("navigation");
    const navigationType = entries.length > 0 ? (entries[0] as PerformanceNavigationTiming).type : null;

    // Check if the page was reloaded
    if (navigationType === "reload") {

      window.location.replace("/");  // Replace the current URL with the home page
    }
  }, []);





  useEffect(() => {

    if (gameStarted) {
      socket.emit('game_started', roomId);
    }

    return () => {
      socket.off('game_started');

    }
  }, [gameStarted, roomId, socket])

  useEffect(() => {
    preloadedSound();
    setLoading(true)



    if (!online) {
      // navigate('/', { replace: true })
      socket.off('time')
      socket.off('timers')
      setPlayerLeft(true);
    }

    socket.on('room_joined', (data) => {

      console.log(data);
      if (data) {
        setRoomId(data);
      } // Update the state with the room ID
      navigate(`/r/${data}`, { replace: true })

    })

    socket.on('user_has_left', (data) => {
      console.log(data)

      socket.disconnect()
    })

    socket.on('score_update', (data) => {
      setScore(data)
      console.log(data)
    })

    socket.on('matching', (data) => {

      setBeginMessage(data)
      setOnMount(true);
      setLoading(false)

    })

    socket.on("gameStarted", (data) => {
      console.log(data, "gameStarted")

      setGameStarted(true);

      setReload(false)

      // setGameState(data)
      setBoard(data.board)
      setPlayer1(data.player1)
      setPlayer2(data.player2);
      setCurrentPlayer(data.currentPlayer)
      socket.off('matching')
      socket.off('no_match')
      socket.on('time', (data) => {
        setScore(data)
      })
    })

    socket.on('no_match', (data) => {
      console.log(data)
      setBeginMessage(data)
      setOnMount(false)
      window.location.replace('/')
    })

    socket.on('invalid_turn', (data) => {
      console.log(data, 'invalid_turn')
    })



    socket.on('winner', (data) => {
      console.log(data)
      setWinner(true)
      setWon(data)
      socket.off('time');
      // setGameStarted(false)
    })

    socket.on('draw', (data) => {
      setWinner(true);
      setWon(data)
      socket.off('time')
    })

    socket.on('player_update', async (data) => {
      setWinner(true)
      setWon(data)
      socket.off('time')
    })


    socket.on('loser', (data) => {
      setWinner(true)
      setWon(data)
    })

    socket.on('playerLeft', (data) => {
      setToast(true)
      setToastMessage(data);

      setPlayerLeft(true);
      socket.off('time')
      socket.off('timers')
    })


    return () => {
      if (socket.off('matching')) {
        socket.off('matching')
      }
      socket.off("no_match");
      socket.off("score_update")
      socket.off("room_joined")
      socket.off('invalid_turn')
      socket.off('updateState')
      socket.off('winner')
      socket.off('player_update');
      socket.off('playerLeft')

    }
  }, [socket, navigate, setPlayer1, setPlayer2, setCurrentPlayer, winner, online, preloadedSound, setPlayerLeft, setRoomId, setBeginMessage, setOnMount, setGameStarted, setBoard, setWinner, setWon, setToast, setToastMessage])


  useEffect(() => {
    socket.on('turn', (data) => {
      setTurn(data);

    })
    return () => {
      socket.off('turn');
    }
  }, [socket, turn])

  useEffect(() => {
    if (turn === '') {
      setTimeout(() => {
        setTurn(null)
      }, 1000)
    }
  }, [turn])

  useEffect(() => {
    socket.on('updatedBoard', (data) => {
      console.log(data)
      if (sounds.sound2) {
        sounds.sound2.play()
      }
      setBoard(data.board)
      setRoomId(data.roomId)
      setCurrentPlayer(data.currentPlayer)
    })
    return () => {
      socket.off("updatedBoard")
    }
  }, [setBoard, setCurrentPlayer, setRoomId, socket, sounds])


  useEffect(() => {
    if (gameStarted && sounds.sound1) {
      console.log('Playing sound as game starts');
      sounds.sound1?.play()
    } else if (gameStarted && !sounds.sounds1) {
      console.warn('Game started but sound not preloaded yet');
    }
  }, [sounds, gameStarted]);





  return (
    <>
      {/* {!roomId && <div>No room found</div>} */}

      {!online && <ModalConnection />}
      {!gameStarted &&
        <div className="text-center ">
          {onMount && <h1 className={`text-4xl leading-8 delay-75 text-white duration-150 ease-in-out`}>Finding a Random Player</h1>}
          <p className="text-white font-bold mt-3 text-2xl">{beginMessage}</p>
          {isLoading && <div className="w-full h-full justify-center flex-col items-center ">
            <span>Loading...</span>
          </div>}
        </div>}
      {gameStarted && (
        <div className="">
          {!online && <ModalConnection />}
          <div className=" min-h-screen w-full">
            {isLoading && <h1>Loading...</h1>}
            {toast && <ToastRoom toastMessage={toastMessage} setToast={setToast} />}
            {turn !== null && <div className="flex h-full flex-col fixed top-1/2 bg-white    -translate-y-1/2 left-1/2 -translate-x-1/2  z-[7777778888444555] w-full justify-center items-center">
              <h1 className="leading-6 text-5xl text-red-300 md:animate-scaleUpMd animate-scaleUpSm  font-extrabold"> {turn}</h1>
            </div>}
            {winner && roomId &&
              <>
                <ModalWinner
                  roomId={roomId}
                  setToast={setToast}
                  setToastMessage={setToastMessage}
                  setPlayerLeft={setPlayerLeft}
                  playerLeft={playerLeft}
                  won={won}
                  winner={winner}
                  setWinner={setWinner}
                />
              </>
            }
            <CreateBoard />
            <div className=" -z-10 bg-blue-400 min-h-[14.625rem]  w-full mt-[-3rem]  rounded-tr-[25%] rounded-tl-[25%] sm:rounded-tr-3xl sm:rounded-tl-3xl"></div>
          </div>
        </div>
      )}
    </>
  )
}