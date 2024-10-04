import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { EventsGateway } from './event/eventgateway';
import { GameManagerService } from './game-manager/game-manager.service';

@Module({
  imports: [EventModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway, GameManagerService],
})
export class AppModule {}
