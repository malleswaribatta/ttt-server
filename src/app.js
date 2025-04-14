import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import {
  currentPlayer,
  joinPlayer,
  markBoard,
  readyForGame,
  reGame,
  removeGameDetails,
  removePlayerDetails,
  serveBoard,
  serveGame,
  serveGameStats,
  validateMove,
} from "./handlers.js";
import _ from "npm:lodash";

export const counter = () => {
  let i = 1;
  return () => i++;
};

const injectCounters = () => {
  const sessionId = counter();
  const counters = { sessionId };

  return async (ctx, next) => {
    ctx.set("counters", counters);
    await next();
  };
};

const injectPlayers = (playerSessionDetails, waiting) => {
  // const playerSessionDetails = [];
  // const waiting = [];

  return async (ctx, next) => {
    ctx.set("playerSessionDetails", playerSessionDetails);
    ctx.set("waiting", waiting);
    await next();
  };
};

const injectGameDetails = (gameDetails) => {
  return async (ctx, next) => {
    ctx.set("gameDetails", gameDetails);
    await next();
  };
};

export const createApp = (context) => {
  const { playerSessionDetails, waiting, gameDetails } = context;
  const app = new Hono();
  app.use("*", logger());
  app.use(injectCounters());
  app.use(injectGameDetails(gameDetails));
  app.use(injectPlayers(playerSessionDetails, waiting));
  app.use(readyForGame);

  app.post("/joinGame", joinPlayer);
  app.get("/findPage", serveGame);
  app.use("/markBoard", validateMove);
  app.post("/markBoard", markBoard);
  app.get("/getBoard", serveBoard);
  app.get("/gameStats", serveGameStats);
  app.get("/removeGameDetails", removeGameDetails);
  app.get("/removePlayerDetails", removePlayerDetails);
  app.get("/currentPlayer", currentPlayer);
  app.get("/reGame", reGame);

  app.use("*", serveStatic({ root: "./public" }));

  return app;
};
