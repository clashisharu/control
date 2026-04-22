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
  Sprite,
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
    let playerAnim: AnimatedSprite | undefined;
    let playerSprite: Sprite | undefined;

    const setup = async () => {
      app = new Application();
      await app.init({
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: true,
        preference: "webgl",
      });

      pixiContainer.current!.appendChild(app.canvas);

      // ---------- Background (tiling) ----------
      const bgTexture = await Assets.load("/background.png");
      background = new TilingSprite({
        texture: bgTexture,
        width: app.screen.width,
        height: app.screen.height,
      });
      app.stage.addChild(background);

      // ---------- Spritesheet slicing (Pixi v8 correct way) ----------
      // Configure these to match your sheet:
      const FRAME_WIDTH = 64;
      const FRAME_HEIGHT = 64;

      // load the strip image as a base texture
      const baseTex = await Assets.load("/walk.png");

const COLS = 4;
const ROWS = 2;

const backFrames: Texture[] = [];
const forwardFrames: Texture[] = [];

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const rect = new Rectangle(c * FRAME_WIDTH, r * FRAME_HEIGHT, FRAME_WIDTH, FRAME_HEIGHT);
    const tex = new Texture({ source: baseTex.source, frame: rect } as any);
    if (r === 0) backFrames.push(tex); // row 0 = backward
    else if (r === 1) forwardFrames.push(tex); // row 1 = forward
  }
}

      // create AnimatedSprite from textures
      const animBack = new AnimatedSprite(backFrames);
animBack.animationSpeed = 0.25;
animBack.loop = true;
animBack.anchor.set(0.5);
animBack.width = FRAME_WIDTH;
animBack.height = FRAME_HEIGHT;
animBack.x = app.screen.width / 2;
animBack.y = app.screen.height - 100;
animBack.visible = false;
app.stage.addChild(animBack);

const animForward = new AnimatedSprite(forwardFrames);
animForward.animationSpeed = 0.25;
animForward.loop = true;
animForward.anchor.set(0.5);
animForward.width = FRAME_WIDTH;
animForward.height = FRAME_HEIGHT;
animForward.x = animBack.x;
animForward.y = animBack.y;
animForward.visible = true;
app.stage.addChild(animForward);



let active = "forward"; // "forward" | "back"
let wasMoving = false;

      // ---------- Physics / movement ----------
      let velocityY = 0;
      const gravity = 0.5;
      const groundY = app.screen.height - 220;

      // Resize handler
      const onResize = () => {
        if (!app) return;
        background!.width = app.screen.width;
        background!.height = app.screen.height;
        if (playerAnim) playerAnim.y = Math.min(playerAnim.y, app.screen.height - 100);
        if (playerSprite) playerSprite.y = Math.min(playerSprite.y, app.screen.height - 100);
      };
      window.addEventListener("resize", onResize);

      // Game loop
     app.ticker.add(() => {
  const a = actionsRef.current;

  // background scroll
  if (a.Forward) background!.tilePosition.x -= 2;
  if (a.Backward) background!.tilePosition.x += 2;

  // determine intent (prefer Forward when both pressed)
  const intendsForward = !!a.Forward && !a.Backward;
  const intendsBackward = !!a.Backward && !a.Forward;
  const isMoving = intendsForward || intendsBackward;

  // choose which animation should be active
  const shouldBe = intendsBackward ? "back" : intendsForward ? "forward" : active;

  // switch only on change
  if (shouldBe !== active) {
    if (shouldBe === "back") {
      // switch to backward animation
      animForward.visible = false;
      animForward.stop();
      animBack.visible = true;
      animBack.play();
    } else if (shouldBe === "forward") {
      animBack.visible = false;
      animBack.stop();
      animForward.visible = true;
      animForward.play();
    }
    active = shouldBe;
  }

  // play/stop on movement transitions (avoid calling gotoAndStop every tick)
  if (isMoving && !wasMoving) {
    if (active === "forward") animForward.play();
    else animBack.play();
  } else if (!isMoving && wasMoving) {
    if (active === "forward") {
      animForward.stop();
      animForward.gotoAndStop(0);
    } else {
      animBack.stop();
      animBack.gotoAndStop(0);
    }
  }
  wasMoving = isMoving;

  // jump physics (unchanged) — apply to whichever anim is visible
  if (a.Jump && (active === "forward" ? animForward.y : animBack.y) >= groundY) {
    velocityY = -10;
  }
  velocityY += gravity;
  if (active === "forward") animForward.y += velocityY;
  else animBack.y += velocityY;

  // clamp to ground
  if ((active === "forward" ? animForward.y : animBack.y) >= groundY) {
    if (active === "forward") animForward.y = groundY;
    else animBack.y = groundY;
    velocityY = 0;
  }
});


      // store cleanup
      (app as any).__cleanup = () => {
        window.removeEventListener("resize", onResize);
      };
    };

    setup();

    return () => {
      if (app) {
        const cleanup = (app as any).__cleanup;
        if (typeof cleanup === "function") cleanup();
        app.destroy();
      }
    };
  }, []);

  return (
    <div className="flex-1 relative">
    <div
      ref={pixiContainer}
      style={{
        width: "100%",
        height: "100%",
        border: "2px solid black",
        overflow: "hidden",
      }}
      className="h-full w-full absolute"
    />
    </div>
  );
}
