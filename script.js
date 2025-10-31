// ✅ Cell factory — unchanged except for name clarity
function Cell() {
    let value = 0;
  
    const addToken = (player) => {
      value = player;
    };
  
    const getValue = () => value;
  
    return {
      addToken,
      getValue
    };
  }
  
  // ✅ Gameboard factory — changed from dropToken → placeToken
function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];
  
    // Create 3×3 grid
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }
  
    const getBoard = () => board;
  
    // ⬇️ CHANGED: No more “drop” logic — place exactly where clicked
    const placeToken = (row, column, player) => {
      const cell = board[row][column];
      // Prevent overwriting
      if (cell.getValue() !== 0) return false;
      cell.addToken(player);
      return true; // signal valid move
    };
  
    const printBoard = () => {
      const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
      console.log(boardWithCellValues);
    };
  
    return { getBoard, placeToken, printBoard };
  }
  
  // ✅ Game controller — controls turns, winner, etc.
function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
  ) {
    const board = Gameboard();
  
    const players = [
      { name: playerOneName, token: "X" },
      { name: playerTwoName, token: "O" }
    ];
  
    let activePlayer = players[0];
    let gameOver = false;
  
    const switchPlayerTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;
  
    // 🧠 Check for winner (simple 3×3 logic)
    const checkWinner = () => {
      const b = board.getBoard().map(row => row.map(cell => cell.getValue()));
  
      // All possible winning combinations
      const winningCombos = [
        // Rows
        [b[0][0], b[0][1], b[0][2]],
        [b[1][0], b[1][1], b[1][2]],
        [b[2][0], b[2][1], b[2][2]],
        // Columns
        [b[0][0], b[1][0], b[2][0]],
        [b[0][1], b[1][1], b[2][1]],
        [b[0][2], b[1][2], b[2][2]],
        // Diagonals
        [b[0][0], b[1][1], b[2][2]],
        [b[0][2], b[1][1], b[2][0]]
      ];
  
      for (let combo of winningCombos) {
        if (combo.every(cell => cell === 1)) return players[0];
        if (combo.every(cell => cell === 2)) return players[1];
      }
  
      // Check for draw (no empty cells)
      const flat = b.flat();
      if (flat.every(cell => cell !== 0)) return "Draw";
  
      return null;
    };
  
    const printNewRound = () => {
      board.printBoard();
      console.log(`${getActivePlayer().name}'s turn.`);
    };
  
    // ⬇️ CHANGED: Now takes row and column
    const playRound = (row, column) => {
      if (gameOver) return; // Stop if already won
  
      console.log(
        `Placing ${getActivePlayer().name}'s token at row ${row}, column ${column}...`
      );
  
      const validMove = board.placeToken(row, column, getActivePlayer().token);
  
      if (!validMove) {
        console.log("Cell already taken! Try again.");
        return;
      }
  
      const winner = checkWinner();
      if (winner) {
        gameOver = true;
        if (winner === "Draw") {
          console.log("It's a draw!");
        } else {
          console.log(`${winner.name} wins!`);
        }
        board.printBoard();
        return;
      }
  
      switchPlayerTurn();
      printNewRound();
    };
  
    printNewRound();
  
    return {
      playRound,
      getActivePlayer,
      getBoard: board.getBoard
    };
  }
  
function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    
    let gameOver = false; // track if the game ended
  
    const updateScreen = () => {
      boardDiv.textContent = "";
  
      const board = game.getBoard();
      const activePlayer = game.getActivePlayer();
  
      // If game over, don't show turn — show result message instead
      if (gameOver) return;
  
      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`
  
      board.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          const cellButton = document.createElement("button");
          cellButton.classList.add("cell");
          cellButton.dataset.row = rowIndex;
          cellButton.dataset.column = columnIndex;
          cellButton.textContent = cell.getValue() === 0 ? "" : cell.getValue();
          boardDiv.appendChild(cellButton);
        });
      });
    }
  
    function clickHandlerBoard(e) {
      if (gameOver) return; // stop playing after win/draw
      const selectedRow = e.target.dataset.row;
      const selectedColumn = e.target.dataset.column;
      if (selectedRow === undefined || selectedColumn === undefined) return;
  
      const result = game.playRound(selectedRow, selectedColumn);
      updateScreen();
  
      // Handle result from game.playRound()
      if (result === "Draw") {
        playerTurnDiv.textContent = "It's a draw!";
        gameOver = true;
      } else if (typeof result === "object" && result.name) {
        playerTurnDiv.textContent = `${result.name} wins! 🎉`;
        gameOver = true;
      }
    }
  
    boardDiv.addEventListener("click", clickHandlerBoard);
  
    updateScreen();
  }
  
  
  ScreenController();
  