import { TicTacToe } from "./ttt.js";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import _ from "npm:lodash";

const joinPlayer = async (ctx) => {
  const sessionId = ctx.get("counters").sessionId();
  const user = await ctx.req.formData();
  const playerName = user.get("player");

  ctx.get("playerSessionDetails").push({ sessionId, playerName });
  ctx.get("waiting").push({ sessionId, playerName });
  setCookie(ctx, "sessionId", sessionId);

  return ctx.redirect("/waiting_page.html");
};

const startGame = (ctx, players) => {
  const [p1, p2] = _.map(players, "playerName");
  const [id1, id2] = _.map(players, "sessionId");
  const game = new TicTacToe(p1, p2);

  ctx.get("gameDetails").push({ id: id1, game });
  ctx.get("gameDetails").push({ id: id2, game });
};

const findInstance = (sessionId, gameDetails) => {
  return _.find(gameDetails, { id: parseInt(sessionId) }).game;
};

const isInstancePresent = (ctx, sessionId) => {
  const gameDetails = ctx.get("gameDetails");

  return findInstance(sessionId, gameDetails);
};

const getPath = (ctx) => {
  const sessionId = +getCookie(ctx, "sessionId");

  if (isInstancePresent(ctx, sessionId)) {
    return "/ttt.html";
  }

  return "/waiting_page.html";
};

const isReady = (players) => {
  return players.length % 2 === 0 && players.length !== 0;
};

const readyForGame = async (ctx, next) => {
  const waiting = ctx.get("waiting");

  if (isReady(waiting)) {
    startGame(ctx, waiting);
    waiting.pop();
    waiting.pop();
    await next();
    return;
  }
  await next();
  return;
};

const getInstance = (ctx) => {
  const sessionId = getCookie(ctx, "sessionId");
  const gameDetails = ctx.get("gameDetails");
  const instance = findInstance(sessionId, gameDetails);

  return instance;
};

const markBoard = async (ctx) => {
  const [row, col] = await ctx.req.json();
  const instance = getInstance(ctx);

  instance.mark(row, col);

  return ctx.text();
};

const serveBoard = (ctx) => {
  const instance = getInstance(ctx);
  const board = instance.getBoard();

  return ctx.json(board);
};

const serveGame = (ctx) => {
  const redirectPath = getPath(ctx);

  return ctx.text(redirectPath);
};

const serveGameStats = (ctx) => {
  const instance = getInstance(ctx);
  const isGameOver = instance.isGameOver();
  const isGameDraw = instance.isDraw();
  const winner = instance.getWinner();
  const stats = { isGameOver, isGameDraw, winner };

  return ctx.json(stats);
};

const findSessionId = (players, currentPlayer) => {
  return _.find(players, { playerName: currentPlayer }).sessionId;
};

const isValidMove = (ctx) => {
  const instance = getInstance(ctx);
  const currentPlayer = instance.getCurrentPlayer();
  const players = ctx.get("playerSessionDetails");
  const sessionId = findSessionId(players, currentPlayer);
  const reqSessionId = getCookie(ctx, "sessionId");

  return sessionId === parseInt(reqSessionId);
};

const validateMove = async (ctx, next) => {
  if (isValidMove(ctx)) {
    await next();
  }
  return ctx.text("invalid move");
};

const removeGameDetails = (ctx) => {
  const gameDetails = ctx.get("gameDetails");
  const sessionId = +getCookie(ctx, "sessionId");
  _.remove(gameDetails, { id: sessionId });

  return ctx.text();
};

const reGame = (ctx) => {
  const players = ctx.get("playerSessionDetails");
  const sessionId = +getCookie(ctx, "sessionId");
  const player = _.find(players, { sessionId: sessionId });
  const waiting = ctx.get("waiting");

  waiting.push(player);

  return ctx.text();
};

const removePlayerDetails = (ctx) => {
  const players = ctx.get("playerSessionDetails");
  const sessionId = +getCookie(ctx, "sessionId");
  _.remove(players, { sessionId: sessionId });

  deleteCookie(ctx, "sessionId");

  return ctx.text();
};

const currentPlayer = (ctx) => {
  const gameDetails = ctx.get("gameDetails");
  const sessionId = getCookie(ctx, "sessionId");
  const instance = findInstance(sessionId, gameDetails);

  return ctx.text(instance.getCurrentPlayer());
};

export {
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
  startGame,
  validateMove,
};
