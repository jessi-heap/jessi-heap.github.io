/**
 * In this problem, you will implement a simple game of Tic Tac Toe.
 * You don't need to worry about creating the UI for the game. Assume that someone else developed the UI and is calling your functions
 * to create a game and track the moves.
 * You need to implement the following functions:
 * 1. createGameBoard(boardDimension: number): This function should create a game board of a given dimension. The default dimension is 3x3.
 * 2. trackPlayerMove(isX: boolean, row: number, col: number): This function should track a player move on the game board and determine if
 * the current player has won the game. The player is either X or O.
 * In the example, the game board is a 3x3 matrix, but you need to implement the functions for any board dimension. It could be quite large.
 * For the sake of this interview, assume that you do not need to handle exception/edge cases and that all moves passed to the function are
 * fair and legal.
 */

/**
 * Any variables you need can go up here.
 */

let gameBoard: Array<Array<boolean | null>> = [];
let gameDimension: number = 3;

/**
 * This function should create a game board of a given dimension.
 * The default dimension is 3x3.
 */
const createGameBoard = (boardDimension: number = 3) => {
    gameDimension = boardDimension;
    for(let i=0; i<gameDimension; i++) {
        let row = [];
        for(let j=0; j<gameDimension; j++) {
            row.push(null);
        }
        gameBoard.push(row);
    }
};

/**
 * This function should track a player move on the game board.
 * The player is either X or O.
 * The row and column are zero-based.
 * The function should return true if the player has won the game.
 */
const trackPlayerMove = (isX: boolean, row: number, col: number) => {
    gameBoard[row][col] = isX;
    // Check for row win
    const i = row;
    for(let j=0; j<gameDimension; j++) {
        if(gameBoard[i][j] !== isX) {
            break;
        }
        if(j === gameDimension - 1) {
            return true;
        }
    }

    // Check for column win
    const j = col;
    for(let i=0; i<gameDimension; i++) {
        if(gameBoard[i][j] !== isX) {
            break;
        }
        if(i === gameDimension - 1) {
            return true;
        }
    }

    // Check for down diagonal win
    if(col === row) {
        for(let i=0; i<gameDimension; i++) {
            if(gameBoard[i][i] !== isX) {
                break;
            }
            if(i === gameDimension - 1) {
                return true;
            }
        }
    }

    // Check for up diagonal win
    if(col + row === gameDimension - 1) {
        for(let i=0; i<gameDimension; i++) {
            if(gameBoard[i][gameDimension - 1 - i] !== isX) {
                break;
            }
            if(i === gameDimension - 1) {
                return true;
            }
        }
    }

    return false;
};

let xsWon = false;
let osWon = false;

// Example game
createGameBoard();
xsWon = trackPlayerMove(true, 0, 0);
console.log(`xsWon: ${xsWon}`); // false
osWon = trackPlayerMove(false, 0, 1);
console.log(`osWon: ${osWon}`); // false
xsWon = trackPlayerMove(true, 1, 0);
console.log(`xsWon: ${xsWon}`); // false
osWon = trackPlayerMove(false, 1, 1);
console.log(`osWon: ${osWon}`); // false
xsWon = trackPlayerMove(true, 2, 0);
console.log(`xsWon: ${xsWon}`); // true