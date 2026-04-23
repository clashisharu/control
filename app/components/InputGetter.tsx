/*"use client";
import "./test.css";
import { useInputHandler } from "@/app/contexts/InputContext";
import { useState, useEffect, useRef } from "react";

export default function InputReceiver() {
  const { actions } = useInputHandler();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [velocityY, setVelocityY] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const gravity = 0.5;
    const spriteSize = 64;

    const loop = () => {
      setPos(prev => {
        const parentWidth = parentRef.current?.offsetWidth || window.innerWidth;
        const parentHeight = parentRef.current?.offsetHeight || window.innerHeight;

        let newX = prev.x + (actions.Forward ? 2 : actions.Backward ? -2 : 0);
        let newY = prev.y;
        let newVelocityY = velocityY;

        // Jump impulse
        if (actions.Jump && prev.y >= 0) {
          newVelocityY = -10;
        }

        // Apply gravity
        newVelocityY += gravity;
        newY += newVelocityY;

        // Ground collision
        if (newY >= 0) {
          newY = 0;
          newVelocityY = 0;
        }

        // Boundary checks based on parent size
        if (newX < 0) newX = 0;
        if (newX > parentWidth - spriteSize) newX = parentWidth - spriteSize;
        if (newY < 0) newY = 0;
        if (newY > parentHeight - spriteSize) newY = parentHeight - spriteSize;

        setVelocityY(newVelocityY);
        return { x: newX, y: newY };
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [actions, velocityY]);

  const rowOffset = actions.Backward ? "0px" : actions.Forward ? "-64px" : "-64px";

  return (
    <div
      ref={parentRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh", // responsive to viewport height
        border: "2px solid black",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "64px",
          height: "64px",
          backgroundImage: "url('/walk.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPositionY: rowOffset,
          animation:
            actions.Forward || actions.Backward
              ? "walk 0.4s steps(4) infinite"
              : "none",
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: "transform 0.1s linear",
        }}
      />
    </div>
  );
}
*/

"use client";
import { useEffect, useRef } from "react";
import {
  Application,
  Assets,
  TilingSprite,
  AnimatedSprite,
  Texture,
  Rectangle,
} from "pixi.js";
import { useInputHandler } from "@/app/contexts/InputContext";

export default function InputReceiver() {
  const { actions } = useInputHandler();
  const pixiContainer = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    if (!pixiContainer.current) return;

    let app: Application | undefined;
    let background: TilingSprite | undefined;
    let animBack: AnimatedSprite | undefined;
    let animForward: AnimatedSprite | undefined;

    const setup = async () => {
      app = new Application();
      await app.init({
        resizeTo: pixiContainer.current!, // resize to the container instead of window
        backgroundAlpha: 0,
        antialias: true,
        preference: "webgl",
      });

      pixiContainer.current!.appendChild(app.canvas);

      // background
      const bgTexture = await Assets.load("/background.png");
const naturalHeight = bgTexture.height;
const groundLine = 244; // pixels from bottom where the floor is drawn
const groundRatio = (naturalHeight - groundLine) / naturalHeight;

      background = new TilingSprite({
        texture: bgTexture,
        width: app.screen.width,
        height: app.screen.height,
      });
      app.stage.addChild(background);

      // sprite sheet slicing
      const FRAME_WIDTH = 64;
      const FRAME_HEIGHT = 64;
      const baseTex = await Assets.load("/walk.png");

      const COLS = 4;
      const ROWS = 2;
      const backFrames: Texture[] = [];
      const forwardFrames: Texture[] = [];

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const rect = new Rectangle(
            c * FRAME_WIDTH,
            r * FRAME_HEIGHT,
            FRAME_WIDTH,
            FRAME_HEIGHT
          );
          const tex = new Texture({ source: baseTex.source, frame: rect } as any);
          if (r === 0) backFrames.push(tex);
          else forwardFrames.push(tex);
        }
      }

      animBack = new AnimatedSprite(backFrames);
      animBack.animationSpeed = 0.25;
      animBack.loop = true;
      animBack.anchor.set(0.5);
      animBack.x = app.screen.width / 2;
      animBack.y = pixiContainer.current!.offsetHeight - FRAME_HEIGHT; // responsive ground
      animBack.visible = false;
      app.stage.addChild(animBack);

      animForward = new AnimatedSprite(forwardFrames);
      animForward.animationSpeed = 0.25;
      animForward.loop = true;
      animForward.anchor.set(0.5);
      animForward.x = animBack.x;
      animForward.y = animBack.y;
      animForward.visible = true;
      app.stage.addChild(animForward);

      let active = "forward";
      let wasMoving = false;
      let velocityY = 0;
      const gravity = 0.5;

      app.ticker.add(() => {
        const a = actionsRef.current;

        // background scroll
        if (a.Forward) background!.tilePosition.x -= 2;
        if (a.Backward) background!.tilePosition.x += 2;

        const intendsForward = !!a.Forward && !a.Backward;
        const intendsBackward = !!a.Backward && !a.Forward;
        const isMoving = intendsForward || intendsBackward;

        const shouldBe = intendsBackward ? "back" : intendsForward ? "forward" : active;

        if (shouldBe !== active) {
          if (shouldBe === "back") {
            animForward!.visible = false;
            animForward!.stop();
            animBack!.visible = true;
            animBack!.play();
          } else {
            animBack!.visible = false;
            animBack!.stop();
            animForward!.visible = true;
            animForward!.play();
          }
          active = shouldBe;
        }

        if (isMoving && !wasMoving) {
          active === "forward" ? animForward!.play() : animBack!.play();
        } else if (!isMoving && wasMoving) {
          if (active === "forward") {
            animForward!.stop();
            animForward!.gotoAndStop(0);
          } else {
            animBack!.stop();
            animBack!.gotoAndStop(0);
          }
        }
        wasMoving = isMoving;

        // responsive ground based on container height
        const groundY = pixiContainer.current!.offsetHeight * groundRatio;

        if (a.Jump && (active === "forward" ? animForward!.y : animBack!.y) >= groundY) {
          velocityY = -10;
        }
        velocityY += gravity;
        if (active === "forward") animForward!.y += velocityY;
        else animBack!.y += velocityY;

        if ((active === "forward" ? animForward!.y : animBack!.y) >= groundY) {
          if (active === "forward") animForward!.y = groundY;
          else animBack!.y = groundY;
          velocityY = 0;
        }
      });
    };

    setup();

    return () => {
      if (app) {
        app.destroy();
      }
    };
  }, []);

  return (
    <div className="flex-1 relative h-full">
      <div
        ref={pixiContainer}
        className="h-[1020px] h- w-full absolute border-black overflow-hidden"
      />
    </div>
  );
}
