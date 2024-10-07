import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import RoomPage from './Screen/RoomPage';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { socket, SocketContext } from './SocketContext';
import { GameProvider } from './GameContext';
import { ManageRoomProvider } from './components/Context/MangaeRoomSocket';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,

  },

  {
    path: '/r',
    element: <RoomPage />
  },
  {
    path: '/r/:id',
    element: <RoomPage />
  }
])

root.render(
  <React.StrictMode>
    <SocketContext.Provider value={socket}>
      <ManageRoomProvider>
        <RouterProvider router={router} />
      </ManageRoomProvider>
    </SocketContext.Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
