import { Logger, OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  ConnectedSocket,
  WsResponse,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { GameManagerService } from 'src/game-manager/game-manager.service';
import { INIT_GAME, MOVE_DISC } from 'src/message/messageevents';

@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: [
      'https://connect4-multi-player.vercel.app/',
      'http://localhost:3001',
    ],
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnModuleInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  constructor(private gameManager: GameManagerService) {}

  afterInit() {
    // server.use(this.socketMiddleware.use.bind(this.socketMiddleware)); // Bind to preserve the `this` context
    this.logger.log('WebSocket Gateway initialized');
  }

  onModuleInit() {
    console.log('feranmi');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.emit('welcome_message', 'welcome to connect 4');
    client.emit('ready', 'lets go');
    client.on('disconnecting', () => {
      // for (const room of client.rooms) {

      client.emit('user_has_left', client.id);
      const games = this.gameManager.games.find(
        (game) =>
          game.player1.socket.id === client.id ||
          game.player2.socket.id === client.id,
      );

      const gameIndex = this.gameManager.games.indexOf(games);

      if (gameIndex !== -1) {
        this.gameManager.games.splice(gameIndex, 1);
      }

      // }
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const games = this.gameManager.games.find(
      (game) =>
        game.player1.socket.id === client.id ||
        game.player2.socket.id === client.id,
    );

    if (!games) {
      // If the game is not found, send acknowledgment with failure response
      client.emit('leaveRoomResponse', {
        success: false,
        message: 'Game not found',
      });
      return;
    }

    const gameIndex = this.gameManager.games.indexOf(games);

    if (games.player1.socket.id === client.id) {
      games.player1.socket.leave(data);

      if (gameIndex !== -1) {
        this.gameManager.games.splice(gameIndex, 1);

        games.player1.socket.emit('leaveRoomResponse', { success: true });
        games.player2.socket.emit('winner', 'You won');
        games.player2.socket.emit('playerLeft', `player1 left the room`);
        games.player1.socket.disconnect();

        // Send acknowledgment of success
      }
    } else if (games.player2.socket.id === client.id) {
      games.player2.socket.leave(data);

      if (gameIndex !== -1) {
        this.gameManager.games.splice(gameIndex, 1);

        games.player2.socket.emit('leaveRoomResponse', { success: true });
        games.player1.socket.emit('winner', 'You won');
        games.player1.socket.emit('playerLeft', `player2 left the room`);
        games.player2.socket.disconnect();
      }
    }
  }

  @SubscribeMessage('rematchRequest')
  handleRematch(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const games = this.gameManager.games.find(
      (game) =>
        game.player1.socket.id === client.id ||
        game.player2.socket.id === client.id,
    );

    if (!games) {
      // Handle case where the game is not found
      console.log(games);
      client.emit(
        'opponent_left',
        'Your opponent has disconnected. Rematch is not possible.',
      );
      return;
    }

    const otherSocket =
      games.player1.socket.id === client.id
        ? games.player2.socket
        : games.player1.socket;
    console.log(otherSocket, 'otherSocket');

    if (otherSocket.connected === false) {
      // Notify the client that the other player has disconnected
      console.log(otherSocket.connected, 'not connected');
      client.emit(
        'rematchAccepted',
        'Your opponent has disconnected. Rematch is not possible.',
      );
      return;
    }

    otherSocket.emit(
      'rematchRequest',
      { roomId: data.roomId },
      async (response) => {
        if (response.status === 'accepted') {
          console.log('accepted');
          client.emit('rematchAccepted', {
            message: 'Rematch accepted, starting game...',
          });
          otherSocket.emit('rematchAccepted', {
            message: 'Rematch accepted, starting game...',
          });
          console.log(games);
          games.board = Array.from({ length: 6 }, () => new Array(7).fill(0));
          this.server.to(data.roomId).emit('gameStarted', {
            roomId: data.roomId,
            board: games.board,
            currentPlayer: {
              id: games.currentPlayer.socket.id,
              score: 0,
            },
            player1: {
              id: games.player1.socket.id,
              score: 0,
            },
            player2: {
              id: games.player2.socket.id,
              score: 0,
            },
          });

          return { status: 'accepted' };
        } else if (response.status === 'rejected') {
          otherSocket.emit('rejectedMatch', 'match was rejected');
          client.emit('rejectedMatch', 'match was rejected');
        } else if (!response) {
          client.emit('opponent_left', 'opponent left the game');
        }
      },
    );
  }

  @SubscribeMessage('welcome')
  handleWelcome(@MessageBody() data: string): WsResponse<unknown> {
    console.log(data);
    const event = 'meet';
    return { event, data };
  }

  @SubscribeMessage(INIT_GAME)
  handleCreateRoom(
    @ConnectedSocket()
    client: Socket,
  ) {
    this.gameManager.addUser({ socket: client }, this.server);
  }

  @SubscribeMessage(MOVE_DISC)
  handleMoveDisc(
    @MessageBody()
    user: {
      column: number;
      board: [][];
      roomId: string;
      currentPlayer: { id: string; name: string };
    },

    @ConnectedSocket() client: Socket,
  ) {
    const games = this.gameManager.games.find(
      (game) =>
        game.player1.socket.id === client.id ||
        game.player2.socket.id === client.id,
    );
    console.log(games.currentPlayer, 'dddd');
    console.log(client.id, 'client connected');

    if (!games) {
      client.emit('error', 'Game not found');
      return;
    }

    // Check if it's the current player's turn
    if (games.currentPlayer.socket.id !== client.id) {
      console.log(user, 'llloppppp');
      client.emit('invalid_turn', 'Not your turn');
      throw new Error('nssssssssssssss');
    }

    games.makeMove(
      user.column,
      user.board,
      client,
      user.roomId,
      games,
      this.server,
    );
  }

  @SubscribeMessage('start_again')
  handleSwitchPlayer(
    @MessageBody()
    data: {
      currentPlayer: { id: string };
      roomId: string;
      mode: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const games = this.gameManager.games.find(
      (game) =>
        game.player1.socket.id === client.id ||
        game.player2.socket.id === client.id,
    );
    // const currentPlayer = games.switchPlayer();

    if (games.currentPlayer.socket.id === games.player1.socket.id) {
      games.player1.socket.emit('player_update', 'You lost');
      games.player2.socket.emit('player_update', 'You won');
    } else if (games.currentPlayer.socket.id === games.player2.socket.id) {
      games.player2.socket.emit('player_update', 'You lost');
      games.player1.socket.emit('player_update', 'You Won');
    }
  }

  @SubscribeMessage('clear_timer')
  handleClearTimer(
    @MessageBody()
    data: {
      currentPlayer: { id: string };
      roomId: string;
      mode: string;
    },
  ) {
    console.log(data);

    this.server.to(data.roomId).emit('timers', 30);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(client);
  }
}
