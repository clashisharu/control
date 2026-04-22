"use client"
import React, { useState, createContext, useEffect } from "react"
import { getConnectedGamepads } from "@/app/lib/gamepad"
type Action = "Jump" | "Forward" | "Backward" | "Sit"
type ActiveActions = Action[]

type InputContextType = {
    actions: Record<Action, boolean>,
    setactions: React.Dispatch<React.SetStateAction<Record<Action, boolean>>>
    gamepads: Gamepad[]
}

const InputContext = createContext<InputContextType | null>(null)
export default function InputProviderReact({ children } : {children: React.ReactNode}) {
    const [actions, setactions] = useState<Record<Action, boolean>>({Jump:false, Forward:false, Backward: false, Sit:false})
    const [gamepads, setGamepads] = useState<Gamepad[]>([]);
    
useEffect(() => {
  function updateGamepads() {
    const pads = getConnectedGamepads();
    setGamepads(pads);

    if (pads[0]) {
      const gp = pads[0];
      const newActions = {
        Jump: gp.buttons[0].pressed,
        Forward: gp.buttons[1].pressed,
        Backward: gp.buttons[2].pressed,
        Sit: gp.buttons[3].pressed,
      };

      // Only update if something changed
      setactions(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newActions)) {
          return newActions;
        }
        return prev;
      });
    }
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
        <InputContext.Provider value={{actions, setactions, gamepads}}>
            {children}
        </InputContext.Provider>
    )
}

export const useInputHandler = () => {
  const ctx = React.useContext(InputContext);
  if (!ctx) throw new Error("useInputHandler must be used within InputProvider");
  return ctx;
};
