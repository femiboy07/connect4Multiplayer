import React, { SetStateAction, useEffect, useState } from "react";
import { useSocket } from "../SocketContext";



export default function ToastRoom({ toastMessage, setToast }: { toastMessage: string, setToast: React.Dispatch<SetStateAction<boolean>> }) {


    useEffect(() => {
        let interval = setTimeout(() => {
            setToast(false)
        }, 5000)
        return () => {
            clearInterval(interval);
        }
    }, [setToast])

    return (
        <div>
            <div className="fixed top-0 right-0 z-[1896]">
                <div className=" bg-red-500 border w-64 h-14 flex p-2 ">
                    <p className="text-white self-center ">{toastMessage}</p>
                </div>
            </div>
        </div>
    )
}