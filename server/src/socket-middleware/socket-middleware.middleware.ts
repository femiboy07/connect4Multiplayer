import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SocketMiddleware.name);

  use(socket: Socket, next: (err?: any) => void): void {
    const clientId = socket.handshake.query.clientId;
    if (clientId) {
      socket.data.clientId = clientId; // Store clientId for later use
      this.logger.log(`Client connected with clientId: ${clientId}`);
      next();
    } else {
      this.logger.warn('No clientId provided');
      next(new Error('No clientId provided'));
    }
  }
}
