import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { EventsGateway } from './event/eventgateway';
import { GameManagerService } from './game-manager/game-manager.service';
import { SocketMiddleware } from './socket-middleware/socket-middleware.middleware';

// import { GameService } from './game/game.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [EventModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway, GameManagerService, SocketMiddleware],
})
export class AppModule {}
