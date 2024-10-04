import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  // app.enableCors({
  //   origin: 'http://localhost:3000', // Replace with your frontend URL
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // });
  await app.listen(port);
}
bootstrap();
