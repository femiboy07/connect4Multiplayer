import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserDTO } from 'src/event/interface/userdto';
import { GameService } from 'src/game/game.service';
import { Server, Socket } from 'socket.io';
@Injectable()
export class GameManagerService {
  public games: GameService[] = [];
  public users: UserDTO[] = [];
  pendingUser: UserDTO | null = null;
  private gameTimer: NodeJS.Timeout | null = null;

  addUser(user: UserDTO, server: Server) {
    if (!user.socket) {
      throw new Error('User socket is needed');
    }

    // Add the user to the list of users
    this.users.push(user);
    console.log('User added:', user);

    // Handle the user's disconnection
    user.socket.on('disconnect', () => {
      this.handleDisconnect(user);
    });

    // Check if there is a pending user waiting for an opponent
    if (this.pendingUser) {
      // If a pending user exists, create a game with both users
      const roomId = uuidv4();
      const game = new GameService(this.pendingUser, user);

      // Join both users to the same room
      user.socket.join(roomId);
      this.pendingUser.socket.join(roomId);

      // Add the game to the list of active games
      this.games.push(game);

      // Start the game for both players
      this.startGame(game, roomId, server);
      user.socket.emit('room_joined', roomId);
      this.pendingUser.socket.emit('room_joined', roomId);

      // Clear the game timer if it exists
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }

      // Reset the pending user
      this.pendingUser = null;
    } else {
      // No match found, so this user becomes the pending user
      this.pendingUser = user;

      // Start a countdown to find an opponent
      let gameTimerSeconds = 30;
      this.gameTimer = setInterval(() => {
        if (gameTimerSeconds > 0) {
          user.socket.emit(
            'matching',
            `Waiting for an opponent to join. ${gameTimerSeconds} seconds remaining.`,
          );
          gameTimerSeconds--;
        } else {
          // No opponent found after the countdown
          user.socket.emit('no_match', 'No match was found');
          clearInterval(this.gameTimer); // Clear the timer

          // Remove the user from the pending state and users list
          this.handleDisconnect(user);
        }
      }, 1000);
    }
  }

  // Handle disconnection (including page reloads)
  handleDisconnect(user: UserDTO) {
    console.log(`User disconnected: ${user.socket.id}`);

    // Remove the user from the users list
    this.users = this.users.filter((u) => u.socket.id !== user.socket.id);

    // If the user was in a pending state, remove them from the pending state
    if (this.pendingUser && this.pendingUser.socket.id === user.socket.id) {
      this.pendingUser = null;

      // Clear any active game timer
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }

      console.log('Pending user disconnected and was removed.');
    }

    // You could add additional cleanup logic for games if needed
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
