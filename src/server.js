import { createApp } from "./app.js";

const context = () => ({
  playerSessionDetails: [],
  waiting: [],
  gameDetails: [],
});

const main = () => {
  const app = createApp(context());
  const port = Deno.env.get("PORT") || 3000;
  Deno.serve({ port }, app.fetch);
};

main();
