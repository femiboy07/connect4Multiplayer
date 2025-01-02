import React, { createContext, SetStateAction, useContext, useState } from 'react';
// import { useSocketDisconnected } from '../../hooks/useSocketDisconnected';
// import { usePreloadedSound } from './usePreloadedSound';

type PlayerObject = { id: string }


interface ManageRoomMessage {
    beginMessage: string;
    setBeginMessage: React.Dispatch<SetStateAction<string>>;
    toastMessage: string;
    setToastMessage: React.Dispatch<SetStateAction<string>>;
    won: string;
    setWon: React.Dispatch<SetStateAction<string>>;
}

interface ManageRoomId {
    roomId: string | null;
    setRoomId: React.Dispatch<SetStateAction<string | null>>;
}

interface ManageConditionals {
    gameStarted: boolean;
    setGameStarted: React.Dispatch<SetStateAction<boolean>>;
    toast: boolean;
    setToast: React.Dispatch<SetStateAction<boolean>>;
    leaveRoom: boolean;
    setLeaveRoom: React.Dispatch<SetStateAction<boolean>>;
    winner: boolean;
    setWinner: React.Dispatch<SetStateAction<boolean>>;
    onMount: boolean;
    setOnMount: React.Dispatch<SetStateAction<boolean>>;
    playerLeft: boolean;
    setPlayerLeft: React.Dispatch<SetStateAction<boolean>>;

}

interface ManageGameBoardProps {
    board: number[][] | null;
    setBoard: React.Dispatch<SetStateAction<number[][] | null>>;
    currentPlayer: { id: string } | null;
    setCurrentPlayer: React.Dispatch<SetStateAction<PlayerObject | null>>;
    player1: { id: string } | null;
    setPlayer1: React.Dispatch<SetStateAction<PlayerObject | null>>;
    player2: { id: string } | null;
    setPlayer2: React.Dispatch<SetStateAction<PlayerObject | null>>;
}

type ManageProps = ManageGameBoardProps & ManageConditionals & ManageRoomId & ManageRoomMessage;


export const ManageRoomContext = createContext<ManageProps | null>(null);



export function useManageRoomContext(): ManageProps {
    const context = useContext(ManageRoomContext);
    if (!context) {
        throw new Error('useManageRoomContext must be used within a ManageRoomProvider');
    }
    return context;
};



export const ManageRoomProvider = ({ children }: { children: React.ReactNode }) => {
    const [beginMessage, setBeginMessage] = useState<string>('')
    const [onMount, setOnMount] = useState<boolean>(false)
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [board, setBoard] = useState<number[][] | null>(null);
    const [winner, setWinner] = useState(false);
    const [won, setWon] = useState('');
    const [leaveRoom, setLeaveRoom] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState<PlayerObject | null>(null);
    const [player1, setPlayer1] = useState<PlayerObject | null>(null);
    const [player2, setPlayer2] = useState<PlayerObject | null>(null);
    const [toast, setToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [playerLeft, setPlayerLeft] = useState(false);

    const AllValues = {
        leaveRoom,
        setLeaveRoom,
        beginMessage,
        setBeginMessage,
        roomId,
        setRoomId,
        playerLeft,
        setPlayerLeft,
        toastMessage,
        setToastMessage,
        setBoard,
        board,
        currentPlayer,
        setCurrentPlayer,
        player1,
        setPlayer1,
        player2,
        setPlayer2,
        winner,
        setWinner,
        won,
        setWon,
        onMount,
        setOnMount,
        gameStarted,
        setGameStarted,
        toast,
        setToast
    }

    return (
        <ManageRoomContext.Provider value={AllValues}>
            {children}
        </ManageRoomContext.Provider>
    )

}

