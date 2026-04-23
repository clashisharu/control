"use client"
import React, { useState, createContext, useEffect } from "react"
import { getConnectedGamepads } from "@/app/lib/gamepad"
type Action = "Jump" | "Forward" | "Backward" | "Sit"
type ActiveActions = Action[]

type InputContextType = {
    actions: Record<Action, boolean>,
    setactions: React.Dispatch<React.SetStateAction<Record<Action, boolean>>>
    actions2: Record<Action, boolean>,
    setactions2: React.Dispatch<React.SetStateAction<Record<Action, boolean>>>
    gamepads: Gamepad[]
}

const InputContext = createContext<InputContextType | null>(null)
export default function InputProviderReact({ children } : {children: React.ReactNode}) {
    const [actions, setactions] = useState<Record<Action, boolean>>({Jump:false, Forward:false, Backward: false, Sit:false})
    const [actions2, setactions2] = useState<Record<Action, boolean>>({Jump:false, Forward:false, Backward: false, Sit:false})
    const [gamepads, setGamepads] = useState<Gamepad[]>([]);
    
useEffect(() => {
  function updateGamepads() {
    const pads = getConnectedGamepads();
    setGamepads(pads);
  }

  // Initial check
  updateGamepads();

  // Poll at a slower interval
  const interval = setInterval(updateGamepads, 50);

  window.addEventListener("gamepadconnected", updateGamepads);
  window.addEventListener("gamepaddisconnected", updateGamepads);

  return () => {
    clearInterval(interval);
    window.removeEventListener("gamepadconnected", updateGamepads);
    window.removeEventListener("gamepaddisconnected", updateGamepads);
  };
}, []);

    return(
        <InputContext.Provider value={{actions, setactions, actions2, setactions2, gamepads}}>
            {children}
        </InputContext.Provider>
    )
}

export const useInputHandler = () => {
  const ctx = React.useContext(InputContext);
  if (!ctx) throw new Error("useInputHandler must be used within InputProvider");
  return ctx;
};
