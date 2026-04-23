"use client";
import { Application, Graphics, Assets, Spritesheet, AnimatedSprite, TilingSprite } from "pixi.js";
import { useRef, useEffect } from "react";
import { Composite, Bodies, Engine, Runner, Body } from "matter-js";
import { useInputHandler } from "@/app/contexts/InputContext";

const spritesheetData = {
  frames: {
    // Row 0 (e.g. "walkBack")
    "walkBack_0": { frame: { x: 0,   y: 0,   w: 64, h: 64 } },
    "walkBack_1": { frame: { x: 64,  y: 0,   w: 64, h: 64 } },
    "walkBack_2": { frame: { x: 128, y: 0,   w: 64, h: 64 } },
    "walkBack_3": { frame: { x: 192, y: 0,   w: 64, h: 64 } },

    // Row 1 (e.g. "walkForward")
    "walkForward_0": { frame: { x: 0,   y: 64, w: 64, h: 64 } },
    "walkForward_1": { frame: { x: 64,  y: 64, w: 64, h: 64 } },
    "walkForward_2": { frame: { x: 128, y: 64, w: 64, h: 64 } },
    "walkForward_3": { frame: { x: 192, y: 64, w: 64, h: 64 } },
  },
  meta: {
    image: "walk.png", // optional, for reference
    size: { w: 256, h: 128 },
    scale: "1",
  },
  animations: {
    walkBack: ["walkBack_0", "walkBack_1", "walkBack_2", "walkBack_3"],
    walkForward: ["walkForward_0", "walkForward_1", "walkForward_2", "walkForward_3"],
  },
};

const bgspritesheetData = {
  "frames": {
    "background": {
      "frame": { "x": 0, "y": 0, "w": 1536, "h": 1024 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 1536, "h": 1024 },
      "sourceSize": { "w": 1536, "h": 1024 }
    }
  },
  "meta": {
    "image": "background.png",
    "format": "RGBA8888",
    "size": { "w": 1536, "h": 1024 },
    "scale": "1"
  },
  "animations": {
    "background": ["background"]
  }
}


export default function Scene() {
  const { actions } = useInputHandler();
  const pixiContainer = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef(actions);

  useEffect(() => {
    const setup = async () => {
      // PIXI SETUP
      const app = new Application();
      await app.init({
        width: 1536,
        height: 1024,
        backgroundColor: 0x1099bb,
        antialias: true,
        resolution: 0.8,
        preference: "webgl",
      });
      if (!pixiContainer.current) return;
      pixiContainer.current.appendChild(app.canvas);

      // MATTERJS SETUP
      const engine = Engine.create();
      const world = engine.world;
      const runner = Runner.create();
      Runner.run(runner, engine);

      // Bodies
      const ground = Bodies.rectangle(768, 780, 1536, 40, { isStatic: true, friction: 10 });
      const playerBox = Bodies.rectangle(1536/2, 740, 40, 64, {
  density: 1,
  friction: 1,
  frictionStatic: 10,
  inertia: Infinity // completely prevents rotation
});
    const circleBox = Bodies.circle((1536 / 2) - 50, 740, 10, {
  isStatic: false,   // dynamic body
  density: 1,
  friction: 0.5,
  restitution: 0.2   // optional bounce
});
    
      Composite.add(world, [ground, playerBox, circleBox]);

      // Spritesheets
      const texture = await Assets.load("/walk.png");
      
      const sheet = new Spritesheet(texture, spritesheetData);
      await sheet.parse();

      const character = new AnimatedSprite(sheet.animations.walkForward);
      character.anchor.set(0.5);
      character.animationSpeed = 0.15;
      app.stage.addChild(character);

      const circle = new Graphics()
        circle.fill(0x00ff00)
        circle.circle(0, 0, 10)
        circle.fill()
        const groundtexture = await Assets.load("/background.png");
      const groundSheet = new TilingSprite(groundtexture);
      groundSheet.tilePosition.x = 0; // adjust to scroll horizontally
      groundSheet.zIndex = -1
        app.stage.addChild(groundSheet);
      const groundSprite = new Graphics();
      groundSprite.fill(0x00ff00);
      groundSprite.rect(-768, -20, 1536, 40);
      groundSprite.fill();
      groundSprite.zIndex = -2
      app.stage.addChild(groundSprite, circle);

      // Sync loop
      app.ticker.add((ticker) => {
        Engine.update(engine, ticker.deltaMS);
        if (actionsRef.current.Forward) {
  Body.setVelocity(playerBox, { x: 5, y: playerBox.velocity.y });
} else if (actionsRef.current.Backward) {
  Body.setVelocity(playerBox, { x: -5, y: playerBox.velocity.y });
}

        character.x = playerBox.position.x;
        character.y = playerBox.position.y;
        character.rotation = playerBox.angle;
        groundSprite.x = ground.position.x;
        groundSprite.y = ground.position.y;
        circle.x = circleBox.position.x;
        circle.y = circleBox.position.y;
      });
      
      // Save references
      actionsRef.current = actions;
      (window as any).character = character;
      (window as any).playerBox = playerBox;
      (window as any).sheet = sheet;
    };

    setup();
  }, []);

  // Handle input separately
  useEffect(() => {
    actionsRef.current = actions;
    const character = (window as any).character;
    const playerBox = (window as any).playerBox;
    const sheet = (window as any).sheet;

    if (!character || !playerBox || !sheet) return;

    if (actions.Forward) {
        console.log("action forward")
      character.textures = sheet.animations.walkForward;
      character.play();
    } else if (actions.Backward) {
      character.textures = sheet.animations.walkBack;
      character.play();
    } else {
        character.gotoAndStop(0)
    }
  }, [actions]);

  return <div ref={pixiContainer}></div>;
}
