"use client";
import { useOpeners } from "@/app/contexts/OpenerContexts"
import {useInputHandler} from "@/app/contexts/InputContext"

export function SelectorToggle() {
  const { isSelectorOpen, setIsSelectorOpen } = useOpeners();
  return (
    <button onClick={() => setIsSelectorOpen(prev => !prev)}>
      {isSelectorOpen ? "Close Selector" : "Open Selector"}
    </button>
  );
}

export function Selector() {
  const { isSelectorOpen, setIsSelectorOpen } = useOpeners();
  
  const { gamepads } = useInputHandler();
  if (!isSelectorOpen) return null;
  return(<div className="fixed inset-0 flex items-center justify-center z-10">
  <div className="z-10 bg-white text-black p-4 border rounded-2xl w-2/4 flex flex-col">
  

      <div className="flex w-full justify-between"><h3>Gamepads:</h3>
      <button onClick={() => setIsSelectorOpen(false)}>x</button>
      </div>
      <ul>
        {gamepads.length != 0 ? <>
        {gamepads.map((g, id) => (
          <li key={id}>
            {g.id} {g.connected ? "(connected)" : "(disconnected)"}
          </li>
        ))} </>: "No gamepads connected"}
      </ul>
    </div>
</div>
)
}