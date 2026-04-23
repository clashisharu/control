"use client";
import { useEffect } from "react";
import { useInputHandler } from "@/app/contexts/InputContext";

export default function KeyboardListener() {
  const { setactions, setactions2 } = useInputHandler();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // ignore auto-repeat events

      setactions(prev => {
        switch (e.code) {
          case "KeyD": return { ...prev, Forward: true };
          case "KeyA": return { ...prev, Backward: true };
          case "Space": return { ...prev, Jump: true };
          case "KeyS": return { ...prev, Sit: true };
          default: return prev;
        }
      });
      setactions2(prev => {
        switch (e.code) {
          case "ArrowRight": return { ...prev, Forward: true };
          case "ArrowLeft": return { ...prev, Backward: true };
          case "ArrowUp": return { ...prev, Jump: true };
          case "ArrowDown": return { ...prev, Sit: true };
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
      setactions2(prev => {
        switch (e.code) {
          case "ArrowRight": return { ...prev, Forward: false };
          case "ArrowLeft": return { ...prev, Backward: false };
          case "ArrowUp": return { ...prev, Jump: false };
          case "ArrowDown": return { ...prev, Sit: false };
          default: return prev;
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setactions]);

  return null;
}
