"use client";
import { Application, Graphics, Assets, Spritesheet, AnimatedSprite, TilingSprite } from "pixi.js";
import { useRef, useEffect } from "react";
import { Composite, Bodies, Engine, Runner, Body, Events  } from "matter-js";
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
    const { actions, actions2 } = useInputHandler();
    const pixiContainer = useRef<HTMLDivElement | null>(null);
    const actionsRef = useRef(actions);
    const actionsRef2 = useRef(actions2);

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

            // MATTERJS bodies
            const worldWidth = 1536;
            const worldHeight = 1024;
const wallCategory = 0x0002;
const ballCategory = 0x0002;
const groundCategory = 0x0004;
const playerCategory = 0x0008;

const ground = Bodies.rectangle(768, 780, 1536, 40, {
  isStatic: true,
  friction: 10,
  restitution: 1,
  collisionFilter: { category: groundCategory}
});

const wallLeft = Bodies.rectangle(0, worldHeight / 2, 40, worldHeight, {
  isStatic: true,
  friction: 0,
  restitution: 1,
  collisionFilter: { category: wallCategory }
  
});

const wallRight = Bodies.rectangle(worldWidth, worldHeight / 2, 40, worldHeight, {
  isStatic: true,
  friction: 0,
  collisionFilter: { category: wallCategory }
});

const playerBox = Bodies.rectangle(1536/2, 740, 20, 64, {
  density: 2,
  friction: 10,
  frictionStatic: 10,
  inertia: Infinity,
  collisionFilter: { category: playerCategory, mask: groundCategory | wallCategory | ballCategory | playerCategory }
});


const playerBox2 = Bodies.rectangle(1536/3, 740, 20, 64, {
  density: 2,
  friction: 10,
  frictionStatic: 10,
  inertia: Infinity,
  collisionFilter: { category: playerCategory, mask: groundCategory | wallCategory | ballCategory | playerCategory }
});

const circleBox = Bodies.circle((1536 / 2) - 50, 740, 10, {
  isStatic: false,
  density: 2,
  friction: 200,
  frictionStatic: 200,
  frictionAir: 0.24,
  inertia: Infinity,
  collisionFilter: { category: ballCategory }
});

// Global collision state
const collisions = {
  player1Wall: false,
  player2Wall: false,
  ballWallRight: false,
  ballWallLeft: false
};

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;

    // Player 1 vs walls
    if ((bodyA === playerBox && (bodyB === wallLeft || bodyB === wallRight)) ||
        (bodyB === playerBox && (bodyA === wallLeft || bodyA === wallRight))) {
      playerBox.friction = 0;
      playerBox.frictionStatic = 0;
      collisions.player1Wall = true;   // mark collision
    }

    // Player 2 vs walls
    if ((bodyA === playerBox2 && (bodyB === wallLeft || bodyB === wallRight)) ||
        (bodyB === playerBox2 && (bodyA === wallLeft || bodyA === wallRight))) {
      playerBox2.friction = 0;
      playerBox2.frictionStatic = 0;
      collisions.player2Wall = true;   // mark collision
    }

    // Player 1 vs ball
    if ((bodyA === playerBox && bodyB === circleBox) ||
        (bodyB === playerBox && bodyA === circleBox)) {
      circleBox.friction = 0.2;   // disable air drag when touching player
      circleBox.frictionStatic = 10;
    }

    // Player 2 vs ball
    if ((bodyA === playerBox2 && bodyB === circleBox) ||
        (bodyB === playerBox2 && bodyA === circleBox)) {
      circleBox.friction = 0.2;   // disable air drag when touching player
      circleBox.frictionStatic = 10;
    }

    // RightWall vs ball
    if ((bodyA === circleBox && bodyB === wallRight) ||
        (bodyB === circleBox && bodyA === wallRight)) { 
        collisions.ballWallRight = true
    }

    // LeftWall vs ball
    if ((bodyA === circleBox && bodyB === wallLeft) ||
        (bodyB === circleBox && bodyA === wallLeft)) { 
        collisions.ballWallLeft = true
    }
  });
});

Events.on(engine, "collisionEnd", (event) => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;

    // Player 1 vs walls
    if ((bodyA === playerBox && (bodyB === wallLeft || bodyB === wallRight)) ||
        (bodyB === playerBox && (bodyA === wallLeft || bodyA === wallRight))) {
      playerBox.friction = 10;
      playerBox.frictionStatic = 10;
      collisions.player1Wall = false;  // clear collision
    }

    // Player 2 vs walls
    if ((bodyA === playerBox2 && (bodyB === wallLeft || bodyB === wallRight)) ||
        (bodyB === playerBox2 && (bodyA === wallLeft || bodyA === wallRight))) {
      playerBox2.friction = 10;
      playerBox2.frictionStatic = 10;
      collisions.player2Wall = false;  // clear collision
    }

    // Player 1 vs ball
    if ((bodyA === playerBox && bodyB === circleBox) ||
        (bodyB === playerBox && bodyA === circleBox)) {
      circleBox.frictionStatic = 200;   // restore default drag when no longer colliding
      circleBox.friction = 200;
    }

    // Player 2 vs ball
    if ((bodyA === playerBox2 && bodyB === circleBox) ||
        (bodyB === playerBox2 && bodyA === circleBox)) {
      circleBox.frictionStatic = 200;   // restore default drag when no longer colliding
      circleBox.friction = 200;
    }
    
    // RightWall vs ball
    if ((bodyA === circleBox && bodyB === wallRight) ||
        (bodyB === circleBox && bodyA === wallRight)) { 
        collisions.ballWallRight = false
    }

    // LeftWall vs ball
    if ((bodyA === circleBox && bodyB === wallLeft) ||
        (bodyB === circleBox && bodyA === wallLeft)) { 
        collisions.ballWallLeft = false
    }
  });
});


            Composite.add(world, [ground, playerBox, circleBox, playerBox2, wallLeft, wallRight]);    // Add bodies to engine world

            // PIXI bodies
            const playerTexture = await Assets.load("/walk.png");
            const playerSheet = new Spritesheet(playerTexture, spritesheetData);
            await playerSheet.parse();

            const character = new AnimatedSprite(playerSheet.animations.walkForward);
            character.anchor.set(0.5);
            character.animationSpeed = 0.15;

            const playerSheet2 = new Spritesheet(playerTexture, spritesheetData);
            await playerSheet2.parse();
            const character2 = new AnimatedSprite(playerSheet2.animations.walkForward);
            character2.anchor.set(0.5);
            character2.animationSpeed = 0.15;

            const circle = new Graphics();
            circle.fill(0x00ff00);
            circle.circle(0, 0, 10);
            circle.fill();

            const backgroundTexture = await Assets.load("/background.png");
            const backgroundSprite = new TilingSprite(backgroundTexture);
            backgroundSprite.tilePosition.x = 0;
            backgroundSprite.zIndex = -1;
            
            const groundSprite = new Graphics();
            groundSprite.fill(0x00ff00);
            groundSprite.rect(-768, -20, 1536, 40);
            groundSprite.fill();
            groundSprite.zIndex = -2;

            app.stage.addChild(groundSprite, circle, backgroundSprite, character, character2);   // Add bodies to pixi app
            
            const playerHeight = 64;
            const groundHeight = 40;
            const maxScroll = 1536 * 5; // 5 tiles wide
            const minScroll = 0;
            const maxOffset = -maxScroll + app.screen.width; // furthest left we can scroll
            
            const halfWidth = app.screen.width / 2;
            // Sync loop
            app.ticker.add(() => {
  // --- Background scrolling logic ---
  const bothRight = playerBox.position.x > halfWidth && playerBox2.position.x > halfWidth;
  const bothLeft  = playerBox.position.x < halfWidth && playerBox2.position.x < halfWidth;

  Engine.update(engine, 1000 / 60);

  // Detect opposite directions
  const p1Forward = actionsRef.current.Forward;
  const p1Backward = actionsRef.current.Backward;
  const p2Forward = actionsRef2.current.Forward;
  const p2Backward = actionsRef2.current.Backward;
  const oppositeDirections = (p1Forward && p2Backward) || (p1Backward && p2Forward);
    const meetOppositeEnds = collisions.player1Wall && collisions.player2Wall
  // --- Player 1 movement ---
  if (actionsRef.current.Forward) {
    Body.setVelocity(playerBox, { x: 5, y: playerBox.velocity.y });

    // Mirror effect: if player2 is idle, move backward
    if (!actionsRef2.current.Forward && !actionsRef2.current.Backward && !collisions.player2Wall && !collisions.ballWallLeft && backgroundSprite.tilePosition.x != maxOffset) {
  Body.setVelocity(playerBox2, { x: -5, y: playerBox2.velocity.y });

  const scrollSpeed = playerBox2.velocity.x; // always use player’s velocity
  Body.setVelocity(circleBox, { x: scrollSpeed, y: circleBox.velocity.y });


      if (!oppositeDirections && !collisions.player2Wall && !collisions.ballWallLeft) {
        backgroundSprite.tilePosition.x = Math.max(
          backgroundSprite.tilePosition.x - 5,
          maxOffset
        );
      }
    }
  } else if (actionsRef.current.Backward) {
    Body.setVelocity(playerBox, { x: -5, y: playerBox.velocity.y });

  
    // Mirror effect: if player2 is idle, move forward
    if (!actionsRef2.current.Forward && !actionsRef2.current.Backward && !collisions.player2Wall && !collisions.ballWallRight && backgroundSprite.tilePosition.x != minScroll) {
  // Give player2 a forward velocity
  Body.setVelocity(playerBox2, { x: 5, y: playerBox2.velocity.y });
   const scrollSpeed = playerBox2.velocity.x;
  Body.setVelocity(circleBox, { x: scrollSpeed, y: circleBox.velocity.y });
}
  // Use the same magnitude as playerBox2’s velocity
  const scrollSpeed = playerBox2.velocity.x;

  if (!oppositeDirections && !collisions.player2Wall && !collisions.ballWallRight) {
    backgroundSprite.tilePosition.x = Math.min(
      backgroundSprite.tilePosition.x + scrollSpeed,
      minScroll
    );
  }


  }

  if (actionsRef.current.Jump) {
    const playerBottom = playerBox.position.y + playerHeight / 2;
    const groundTop = ground.position.y - groundHeight / 2;
    const epsilon = 1;
    const isGrounded = Math.abs(playerBottom - groundTop) < epsilon;
    if (isGrounded) {
      Body.setVelocity(playerBox, { x: playerBox.velocity.x, y: -10 });
    }
  }

  if (actionsRef2.current.Forward) {
    Body.setVelocity(playerBox2, { x: 5, y: playerBox2.velocity.y });
        if (!actionsRef.current.Forward && !actionsRef.current.Backward && !collisions.player1Wall && !collisions.ballWallLeft && backgroundSprite.tilePosition.x != maxOffset) {
  Body.setVelocity(playerBox, { x: -5, y: playerBox.velocity.y });

  const scrollSpeed = playerBox.velocity.x; // always use player’s velocity
  Body.setVelocity(circleBox, { x: scrollSpeed, y: circleBox.velocity.y });
}
    if (!oppositeDirections && !collisions.player1Wall && !collisions.ballWallLeft) {
      backgroundSprite.tilePosition.x = Math.max(
        backgroundSprite.tilePosition.x - 5,
        maxOffset
      );
    }
  } else if (actionsRef2.current.Backward) {
    Body.setVelocity(playerBox2, { x: -5, y: playerBox2.velocity.y });
    if (!actionsRef.current.Forward && !actionsRef.current.Backward && !collisions.player1Wall && !collisions.ballWallRight && backgroundSprite.tilePosition.x != minScroll) {
  Body.setVelocity(playerBox, { x: 5, y: playerBox.velocity.y });

  const scrollSpeed = playerBox.velocity.x; // always use player’s velocity
  Body.setVelocity(circleBox, { x: scrollSpeed, y: circleBox.velocity.y });
}
    if (!oppositeDirections && !collisions.player1Wall && !collisions.ballWallRight) {
      backgroundSprite.tilePosition.x = Math.min(
        backgroundSprite.tilePosition.x + 5,
        minScroll
      );
    }
  }

  if (actionsRef2.current.Jump) {
    const playerBottom = playerBox2.position.y + playerHeight / 2;
    const groundTop = ground.position.y - groundHeight / 2;
    const epsilon = 1;
    const isGrounded = Math.abs(playerBottom - groundTop) < epsilon;
    if (isGrounded) {
      Body.setVelocity(playerBox2, { x: playerBox2.velocity.x, y: -10 });
    }
  }

  character.x = playerBox.position.x;
  character.y = playerBox.position.y;
  character.rotation = playerBox.angle;
  character2.x = playerBox2.position.x;
  character2.y = playerBox2.position.y;
  character2.rotation = playerBox2.angle;
  groundSprite.x = ground.position.x;
  groundSprite.y = ground.position.y;
  circle.x = circleBox.position.x;
  circle.y = circleBox.position.y;
});

            
            // Save references
            actionsRef.current = actions;
            actionsRef2.current = actions2;
            (window as any).character = character;
            (window as any).character2 = character2;
            (window as any).playerBox = playerBox;
            (window as any).playerSheet = playerSheet;
            (window as any).playerBox2 = playerBox2;
            (window as any).playerSheet2 = playerSheet2;
        };
        setup();
    }, []);

    // Handle input separately
    useEffect(() => {
        actionsRef.current = actions;
        const character = (window as any).character;
        const playerBox = (window as any).playerBox;
        const playerSheet = (window as any).playerSheet;

        if (!character || !playerBox || !playerSheet) return;

        if (actions.Forward) {
            console.log("action forward")
            character.textures = playerSheet.animations.walkForward;
            character.play();
        } else if (actions.Backward) {
            character.textures = playerSheet.animations.walkBack;
            character.play();
        } else {
            console.log("Stopping 1st", character);
            character.gotoAndStop(0)
        }
    }, [actions]);

useEffect(() => {
  actionsRef2.current = actions2;
  const character2 = (window as any).character2;
  const playerBox2 = (window as any).playerBox2;
  const playerSheet2 = (window as any).playerSheet2;

  if (!playerBox2 || !character2 || !playerSheet2) return;

  if (actions2.Forward) {
    console.log("action forward");
    character2.textures = playerSheet2.animations.walkForward;
    character2.play();
  } else if (actions2.Backward) {
    character2.textures = playerSheet2.animations.walkBack;
    character2.play();
  } else {
    console.log("Stopping 2nd", character2);
    character2.gotoAndStop(0);
  }
}, [actions2]);


  return <div ref={pixiContainer}></div>;
}
