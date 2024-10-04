import { SocketMiddlewareMiddleware } from './socket-middleware.middleware';

describe('SocketMiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new SocketMiddlewareMiddleware()).toBeDefined();
  });
});
