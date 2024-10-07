import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserDTO } from 'src/event/interface/userdto';
import { GameService } from 'src/game/game.service';
import { Server, Socket } from 'socket.io';
@Injectable()
export class GameManagerService {
  public games: GameService[] = [];
  private users: UserDTO[] = [];
  pendingUser: UserDTO | null = null;
  private gameTimer: NodeJS.Timeout | null = null;

  addUser(user: UserDTO, server: Server) {
    if (user.socket) {
      this.users.push(user);
      console.log(user);

      // Handle the case where the user reloads or disconnects
      user.socket.on('disconnect', () => {
        this.handleDisconnect(user);
      });

      // Handle when a pending user is found
      if (this.pendingUser && user) {
        const roomId = uuidv4();
        const game = new GameService(this.pendingUser, user);

        // Join both users to the room
        user.socket.join(roomId);
        this.pendingUser.socket.join(roomId);

        this.games.push(game);

        // Emit room join and start the game for both players
        this.startGame(game, roomId, server);
        user.socket.emit('room_joined', roomId);
        this.pendingUser.socket.emit('room_joined', roomId);

        // Clear the game timer if it was running
        if (this.gameTimer) {
          clearInterval(this.gameTimer);
        }

        // Reset pending user
        this.pendingUser = null;
      } else {
        // No match found yet, set this user as pending
        this.pendingUser = user;

        // Start the countdown for finding an opponent
        let gameTimerSeconds = 30;
        this.gameTimer = setInterval(() => {
          if (gameTimerSeconds > 0) {
            user.socket.emit(
              'matching',
              `waiting for an opponent to arrive ${gameTimerSeconds} seconds remaining`,
            );
            gameTimerSeconds--;
          } else {
            // No match found after the countdown
            user.socket.emit('no_match', 'No match was found');
            clearInterval(this.gameTimer); // Stop the timer

            // Remove the user from pending state and users list
            this.handleDisconnect(user);
          }
        }, 1000);
      }
    } else {
      throw new Error('User socket is needed');
    }
  }

  // Handle user disconnection
  handleDisconnect(user: UserDTO) {
    console.log(`User disconnected: ${user.socket.id}`);

    // Remove the user from the users list
    this.users = this.users.filter((u) => u.socket.id !== user.socket.id);

    // Check if the user was the pending user
    if (this.pendingUser && this.pendingUser.socket.id === user.socket.id) {
      this.pendingUser = null;

      // Clear any active game timer
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }
    }
  }

  startGame(game: GameService, roomId: string, server: Server) {
    if (!game) {
      throw Error('game not found');
    }

    // Emit the gameStarted event to all users in the room
    server.to(roomId).emit('gameStarted', {
      roomId: roomId,
      board: game.board,
      currentPlayer: {
        id: game.currentPlayer.socket.id,
      },
      player1: {
        id: game.player1.socket.id,
      },
      player2: {
        id: game.player2.socket.id,
      },
    });

    game.player1.socket.emit('turn', 'Its Your Turn');
    game.player2.socket.emit('turn', 'GameStarted');

    setTimeout(() => {
      game.player1.socket.emit('turn', '');
      game.player2.socket.emit('turn', '');
    }, 5000);
  }

  playAgain(socket: Socket, otherSocket: Socket, roomId: string) {
    const game = this.games.find(
      (g) =>
        (g.player1.socket.id === socket.id &&
          g.player2.socket.id === socket.id) ||
        (g.player2.socket.id === otherSocket.id &&
          g.player1.socket.id === otherSocket.id),
    );
    console.log(game, 'games');
    if (game) {
      console.log(game);

      game.board = this.initializeBoard();
      game.currentPlayer = game.player1; // Or whichever logic you have

      socket.emit('gameStarted', {
        roomId: roomId,
        board: game.board,
        currentPlayer: {
          id: game.currentPlayer.socket.id,
        },
        player1: {
          id: game.player1.socket.id,
        },
        player2: {
          id: game.player2.socket.id,
        },
      });

      otherSocket.emit('gameStarted', {
        roomId: roomId,
        board: game.board,
        currentPlayer: {
          id: game.currentPlayer.socket.id,
        },
        player1: {
          id: game.player1.socket.id,
        },
        player2: {
          id: game.player2.socket.id,
        },
      });
    } else {
      socket.emit('error', 'No existing game found for play again.');
    }
  }

  initializeBoard(): number[][] {
    return Array.from({ length: 6 }, () => new Array(7).fill(0));
  }

  destroyGame(index: number) {
    this.games.splice(index, 1);
  }
}
