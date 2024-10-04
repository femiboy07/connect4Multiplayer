import { createContext, SetStateAction, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

 interface gameProps{
    isClick:boolean,
    setIsClick:React.Dispatch<SetStateAction<boolean>>
}
// Custom hook to use the socket context

 const GameContext=createContext<gameProps | undefined>(undefined)



export function  useGameContext():gameProps{
    const context=useContext(GameContext)
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
}


export  const GameProvider=({children}:{children:React.ReactNode})=>{
    const [isClick,setIsClick]=useState(true);
    

    useEffect(()=>{
        const handleBeforeUnload = () => {
            // This function is called before the page reloads or closes
            console.log('Page is reloading or closing...');
            
            // Do something here, like saving data, sending an API call, etc.
            // event.returnValue is required for certain browsers to show a confirmation dialog
            
            // For older browsers
        
          };
      
          // Add event listener for page reload or close
          window.addEventListener('beforeunload', handleBeforeUnload);
          
          // Cleanup the event listener on component unmount
          return () => {
            
            window.removeEventListener('beforeunload', handleBeforeUnload);
          }
       
    },[])
  return (
     <GameContext.Provider value={{isClick,setIsClick}}>
       {children}
     </GameContext.Provider>
  )

}


// export default GameProvider