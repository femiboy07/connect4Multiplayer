import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserDTO } from 'src/event/interface/userdto';

@Injectable()
export class GameService {
  public player1: UserDTO;
  public player2: UserDTO;
  board: number[][];
  currentPlayer: UserDTO;
  score: number;
  public moveMade: boolean;

  playerNumber: number;

  constructor(player1: UserDTO, player2: UserDTO) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = Array.from({ length: 6 }, () => new Array(7).fill(0));
    this.currentPlayer = player1;
    this.score = 0;
    this.playerNumber = 30;
  }

  makeMove(
    column: number,
    board: [][],
    client: Socket,
    roomId: string,
    games: GameService,
    server: Server,
  ): boolean {
    //validate if the user can drop the piece;
    //check the turn of who is playing which is already easy cause of current players
    console.log(column, 'nammeee');
    console.log(server);

    console.log('move about to be made');

    if (!this.validateColumn(games.board, column)) {
      client.emit('invalid_move', 'pls an invalid move column full ');
      return;
    }
    console.log('logging');

    this.dropPiece(column, games);

    const currentPlayers = games.switchPlayer();
    console.log(currentPlayers.socket.id, 'switching players');
    this.player1.socket.emit('updatedBoard', {
      roomId: roomId,
      board: board,
      currentPlayer: {
        id: currentPlayers.socket.id,
      },
    });

    this.player2.socket.emit('updatedBoard', {
      roomId: roomId,
      board: board,
      currentPlayer: {
        id: currentPlayers.socket.id,
      },
    });

    if (this.winner(board, games)) {
      this.winner(board, games);
      server.to(roomId).emit('score_update', games.score);
      return;
    }

    if (this.gameDraw(board)) {
      this.handleDraw(games);
      return;
    }

    console.log(this.moveMade, 'second');

    return true;
  }

  validateColumn(board: number[][], col: number): boolean {
    for (let row = 0; row < board.length; row++) {
      if (board[row][col] === 0) {
        return true;
      }
    }
    return false;
  }

  switchPlayer() {
    const currentPlayers =
      this.currentPlayer.socket.id === this.player1.socket.id
        ? this.player2
        : this.player1;
    this.currentPlayer = currentPlayers;

    return currentPlayers;
  }

  // Reset the timer and moveMade flag
  dropPiece(column: number, game: GameService) {
    for (let row = game.board.length - 1; row >= 0; row--) {
      if (game.board[row][column] === 0) {
        game.board[row][column] =
          game.currentPlayer.socket.id === game.player1.socket.id ? 1 : 2;
        return; // Add a return statement to exit the loop once a piece is dropped
      }
    }
  }

  gameDraw(board: number[][]): boolean {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 0) {
          return false;
        }
      }
    }

    return true;
  }
  handleDraw(game: GameService) {
    // Handle the draw scenario, e.g., update the game state, emit a draw event to both players
    game.player1.socket.emit('draw', "It's a draw!");
    game.player2.socket.emit('draw', "It's a draw!");
  }

  winner(board: number[][], games: GameService) {
    // Check rows
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          board[i][j] !== 0 &&
          board[i][j] === board[i][j + 1] &&
          board[i][j] === board[i][j + 2] &&
          board[i][j] === board[i][j + 3]
        ) {
          if (board[i][j] === 1) {
            games.player1.socket.emit('winner', 'You won');

            games.player2.socket.emit('winner', 'You lost');
            return true;
          } else {
            games.player2.socket.emit('winner', 'You won');

            games.player1.socket.emit('winner', 'You lost');
            return true;
          }
        }
      }
    }

    // Check columns
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 3; j++) {
        if (
          board[j][i] !== 0 &&
          board[j][i] === board[j + 1][i] &&
          board[j][i] === board[j + 2][i] &&
          board[j][i] === board[j + 3][i]
        ) {
          if (board[j][i] === 1) {
            games.player1.socket.emit('winner', 'You won');

            games.player2.socket.emit('winner', 'You lost');
          } else {
            games.player2.socket.emit('winner', 'You won');

            games.player1.socket.emit('winner', 'You lost');
          }
          return false;
        }
      }
    }

    // Check diagonals
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          j < 4 &&
          i < 3 &&
          board[i][j] !== 0 &&
          board[i][j] === board[i + 1][j + 1] &&
          board[i][j] === board[i + 2][j + 2] &&
          board[i][j] === board[i + 3][j + 3]
        ) {
          if (board[i][j] === 1) {
            games.player1.socket.emit('winner', 'You won');
            games.player2.socket.emit('winner', 'You lost');
            return true;
          } else {
            games.player2.socket.emit('winner', 'You won');

            games.player1.socket.emit('winner', 'You lost');
            return true;
          }
        }

        if (
          j > 2 &&
          i < 3 &&
          board[i][j] !== 0 &&
          board[i][j] === board[i + 1][j - 1] &&
          board[i][j] === board[i + 2][j - 2] &&
          board[i][j] === board[i + 3][j - 3]
        ) {
          if (board[i][j] === 1) {
            games.player1.socket.emit('winner', 'You won');

            games.player2.socket.emit('winner', 'You lost');
          } else {
            games.player2.socket.emit('winner', 'You won');

            games.player1.socket.emit('winner', 'You lost');
          }
          return false;
        }
      }
    }

    // If no winner is found, return null
    return null;
  }
  endGame(winner: UserDTO) {
    winner.socket.emit('winner', ` You won the game`);
  }
}
