import React from "react";




export default function Logo(){
    return (
        <div className=" absolute left-1/2 -translate-x-1/2">
        <div className="flex max-w-8 flex-wrap gap-2 ">
            <div className="rounded-full w-2 h-2 bg-pink-600"></div>
            <div className="rounded-full w-2 h-2 bg-yellow-400" ></div>
            <div className="rounded-full w-2 h-2 bg-pink-600"></div>
            <div className="rounded-full w-2 h-2 bg-yellow-400"></div>
        </div>
        </div>
    )
}