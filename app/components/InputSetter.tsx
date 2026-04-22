"use client";
import { useEffect } from "react";
import { useInputHandler } from "@/app/contexts/InputContext";

export default function GamepadListener() {
  const { setactions, gamepads } = useInputHandler();

  useEffect(() => {
    // --- Keyboard mapping ---
    const handleKeyDown = (e: KeyboardEvent) => {
      setactions(prev => {
        switch (e.code) {
          case "KeyD": return { ...prev, Forward: true };
          case "KeyA": return { ...prev, Backward: true };
          case "Space": return { ...prev, Jump: true };
          case "KeyS": return { ...prev, Sit: true };
          default: return prev;
        }
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setactions(prev => {
        switch (e.code) {
          case "KeyD": return { ...prev, Forward: false };
          case "KeyA": return { ...prev, Backward: false };
          case "Space": return { ...prev, Jump: false };
          case "KeyS": return { ...prev, Sit: false };
          default: return prev;
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // --- Gamepad polling ---
    const poll = () => {
      if (gamepads.length > 0) {
        const gp = gamepads[0]; // first controller
        setactions(prev => ({
          ...prev,
          Jump: gp.buttons[0].pressed,        // A / Cross
          Sit: gp.buttons[1].pressed,         // B / Circle
          Forward: gp.axes[0] > 0.5,          // stick pushed right
          Backward: gp.axes[0] < -0.5,        // stick pushed left
        }));
      }
      requestAnimationFrame(poll);
    };
    poll();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gamepads, setactions]);

  return null; // just updates context
}
