import { SocketMiddleware } from './socket-middleware.middleware';

describe('SocketMiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new SocketMiddleware()).toBeDefined();
  });
});
