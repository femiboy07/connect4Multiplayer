import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../SocketContext';
import { useSocketDisconnected } from '../hooks/useSocketDisconnected';
import { useManageRoomContext } from './Context/MangaeRoomSocket';


export default function BoardTime({ clicked, onClick }: { clicked: boolean, onClick: Function }) {
    const { currentPlayer, player1, player2, roomId, winner, setCurrentPlayer, gameStarted } = useManageRoomContext()
    const player = currentPlayer && player1 && currentPlayer.id === player1.id ? 'player 1"s turn' : 'player 2"s turn';
    let timerId = useRef<any | null>(null);
    const socket = useSocket();
    const [countdown, setCountDown] = useState<number>(30); // Use useState for countdown
    const online = useSocketDisconnected()
    console.log(currentPlayer);




    useEffect(() => {
        if (gameStarted) {
            // Start the interval for countdown
            const startCountdown = () => {
                timerId.current = setInterval(() => {
                    setCountDown((prev) => {
                        if (prev === 0) {
                            // Clear the interval and notify the server when it reaches 0
                            clearInterval(timerId.current!);
                            socket.emit('start_again', { currentPlayer, roomId, mode: 'switch' });
                            return 30
                            // Reset countdown (optional)
                        }
                        return prev - 1;
                    });
                }, 1000);
            };

            if (winner) {
                clearInterval(timerId.current);
                socket.off('timers')
                timerId.current = null
            }

            if (!online) {
                clearInterval(timerId.current);
                socket.off('timers');
                socket.off('time')
                timerId.current = null;

            }
            startCountdown(); // Initial start
            socket.on('playerLeft', (data) => {
                console.log(data)
                clearInterval(timerId.current);
                socket.off('time');


                timerId.current = null

            })



            // Listen for 'timers' event from the server
            socket.on('timers', (data) => {
                if (timerId.current) {
                    clearInterval(timerId.current); // Clear the existing interval
                }
                console.log(data, 'the value');
                setCountDown(data);
                // Update the countdown with the new value from the server

                // Restart the countdown after receiving new value
                if (winner) {
                    clearInterval(timerId.current!);
                    socket.off('timers')
                    timerId.current = null
                    return;
                } else {
                    startCountdown();
                }
            });




            // Clear the timer if the user clicks
            if (clicked) {
                clearInterval(timerId.current!);
                socket.emit('clear_timer', { currentPlayer, roomId, mode: 'switch_not' });
            }

            // Cleanup the interval and socket listener when component unmounts
            return () => {
                if (timerId.current) {
                    clearInterval(timerId.current);
                }
                socket.off('timers');
                // Remove the socket listener
                // socket.off('winner')
                socket.off('playerLeft')

            };
        }
    }, [currentPlayer, gameStarted, clicked, socket, roomId, setCurrentPlayer, winner, online]);


    return (
        <div className={`turns-container absolute top-full -translate-y-3.5 md:-translate-y-1/4 left-1/2 -translate-x-1/2 my-0  mx-auto z-1 ${player === 'player 1"s turn' ? 'player-one-image' : 'player-two-image'} `}>
            <div className='flex flex-col pt-[3rem] text-center'>
                <span className='uppercase text-white font-bold text-[1rem]'>{player}</span>
                <span className="w-full text-center text-white text-[3.5rem] ">{countdown}</span>
            </div>
        </div>
    );
}