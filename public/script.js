const displayBoard = (board) => {
  board.forEach((row, rowNo) => {
    row.forEach((col, colNo) => {
      const box = document.getElementById(`${rowNo},${colNo}`);
      box.textContent = col;
    });
  });
};

const markBoard = async (row, col) => {
  const response = await fetch("/markBoard", {
    method: "POST",
    body: JSON.stringify([row, col]),
  });

  return await response.text();
};

const getBoard = async () => {
  const response = await fetch("/getBoard");
  return await response.json();
};

const getGameStats = async () => {
  const res = await fetch("/gameStats");
  return await res.json();
};

const handleMoves = async (event) => {
  event.preventDefault();

  const [row, col] = event.target.id.split(",");
  await markBoard(row, col);
};

const handleGameOver = async (isGameDraw, winner) => {
  let msg = ` ${winner} Won the game`;

  if (isGameDraw) {
    msg = "Game is Drawn";
  }

  const userResponse = confirm(`${msg}\nDo you want to play again?`);

  if (userResponse) {
    await fetch("/reGame");
    globalThis.location.href = "/waiting_page.html";
  } else {
    await fetch("/removePlayerDetails");
    globalThis.location.href = "/index.html";
  }
};

const updateCurrentPlayer = async () => {
  const currentPlayer = document.querySelector(".current-player");
  const res = await fetch("/currentPlayer");
  const currPlayer = await res.text();

  currentPlayer.textContent = `Current Player:${currPlayer}`;
};

const gameOver = async (id) => {
  const { isGameOver, isGameDraw, winner } = await getGameStats();

  if (isGameOver) {
    await fetch("/removeGameDetails");
    clearInterval(id);
    handleGameOver(isGameDraw, winner);
    return;
  }
};

const main = () => {
  const board = document.querySelector(".board");

  const id = setInterval(async () => {
    const updatedBoard = await getBoard();

    displayBoard(updatedBoard);

    await updateCurrentPlayer();

    await gameOver(id);
  }, 1000);

  board.addEventListener("click", handleMoves);
};

globalThis.onload = main;
