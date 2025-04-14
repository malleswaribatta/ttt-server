import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { createApp } from "../src/app.js";
import { TicTacToe } from "../src/ttt.js";

describe("joinPlayer", () => {
  it("should respond with redirection code", async () => {
    const context = { playerSessionDetails: [], waiting: [] };
    const app = createApp(context);
    const formData = new FormData();
    formData.set("player", "p1");

    const req = new Request("http:/localhost/joinGame", {
      method: "POST",
      body: formData,
    });

    const response = await app.request(req);
    assertEquals(response.status, 302);
  });
});

describe("serveGame", () => {
  it("should respond with redirection path", async () => {
    const game = new TicTacToe("p1", "p2");

    const context = {
      waiting: [],
      gameDetails: [
        { id: 1, game },
        { id: 2, game },
      ],
    };

    const app = createApp(context);
    const req = new Request("http:/localhost/findPage", {
      headers: {
        cookie: "sessionId=2",
      },
    });

    const response = await app.request(req);
    const path = await response.text();

    assertEquals(response.status, 200);
    assertEquals(path, "/ttt.html");
  });
});

describe("validate move", () => {
  it("should respond with 'invalid move' if  move is in valid", async () => {
    const game = new TicTacToe("p1", "p2");
    const context = {
      waiting: [],
      gameDetails: [
        { id: 1, game },
        { id: 2, game },
      ],
      playerSessionDetails: [{ sessionId: 1, playerName: "p1" }],
    };
    const app = createApp(context);
    const req = new Request("http:/localhost/markBoard", {
      headers: {
        cookie: "sessionId=2",
      },
    });
    const response = await app.request(req);

    assertEquals(await response.text(), "invalid move");
  });
});

describe("markBoard", () => {
  it("should respond with ok if board updated", async () => {
    const game = new TicTacToe("p1", "p2");
    const context = {
      waiting: [],
      gameDetails: [
        { id: 1, game },
        { id: 2, game },
      ],
      playerSessionDetails: [{ sessionId: 1, playerName: "p1" }],
    };

    const app = createApp(context);
    const data = JSON.stringify([0, 0]);
    const req = new Request("http:/localhost/markBoard", {
      method: "POST",
      body: data,
      headers: {
        cookie: "sessionId=2",
      },
    });

    const response = await app.request(req);

    assertEquals(response.status, 200);
  });
});

describe("serveBoard", () => {
  it("should respond with  board ", async () => {
    const game = new TicTacToe("p1", "p2");
    const context = {
      waiting: [],
      gameDetails: [
        { id: 1, game },
        { id: 2, game },
      ],
    };
    const app = createApp(context);
    const req = new Request("http:/localhost/getBoard", {
      headers: {
        cookie: "sessionId=2",
      },
    });
    const response = await app.request(req);

    assertEquals(response.status, 200);
  });
});

describe("serveGameStats", () => {
  it("should respond with  game stats ", async () => {
    const game = new TicTacToe("p1", "p2");
    const context = {
      waiting: [],
      gameDetails: [
        { id: 1, game },
        { id: 2, game },
      ],
    };
    const app = createApp(context);
    const req = new Request("http:/localhost/gameStats", {
      headers: {
        cookie: "sessionId=2",
      },
    });
    const response = await app.request(req);

    assertEquals(response.status, 200);
    assertEquals(await response.json(), {
      isGameDraw: false,
      isGameOver: false,
      winner: null,
    });
  });
});

describe("remove Game Details", () => {
  it("should respond with ok if game details removed", async () => {
    const context = {
      waiting: [],
      playerSessionDetails: [
        { sessionId: 1, playerName: "p1" },
        { sessionId: 2, playerName: "p2" },
      ],
    };
    const app = createApp(context);
    const req = new Request("http:/localhost/removeGameDetails", {
      headers: {
        cookie: "sessionId=1",
      },
    });
    const response = await app.request(req);

    assertEquals(response.status, 200);
  });
});

describe("remove player Details", () => {
  it("should respond with ok if player details removed", async () => {
    const context = {
      waiting: [],
      playerSessionDetails: [
        { sessionId: 1, playerName: "p1" },
        { sessionId: 2, playerName: "p2" },
      ],
    };
    const app = createApp(context);
    const req = new Request("http:/localhost/removePlayerDetails", {
      headers: {
        cookie: "sessionId=1",
      },
    });

    const response = await app.request(req);

    assertEquals(response.status, 200);
  });
});

describe("current Player", () => {
  it("should respond with current player", async () => {
    const game = new TicTacToe("p1", "p2");
    const context = {
      waiting: [],
      gameDetails: [
        { id: 1, game },
        { id: 2, game },
      ],
    };
    const app = createApp(context);
    const req = new Request("http:/localhost/currentPlayer", {
      headers: {
        cookie: "sessionId=1",
      },
    });
    const response = await app.request(req);

    assertEquals(response.status, 200);
    assertEquals(await response.text(), "p1");
  });
});

describe("reGame", () => {
  it("should respond with current player", async () => {
    const game = new TicTacToe("p1", "p2");
    const context = {
      waiting: [],
      gameDetails: [
        { id: 1, game },
        { id: 2, game },
      ],
      playerSessionDetails: [{ sessionId: 1, playerName: "p1" }],
    };
    const app = createApp(context);
    const req = new Request("http:/localhost/reGame", {
      headers: {
        cookie: "sessionId=1",
      },
    });

    const response = await app.request(req);

    assertEquals(response.status, 200);
  });
});
