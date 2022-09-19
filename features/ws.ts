import http from 'http';
import { Server } from 'socket.io';
import { TokenType, verifyToken } from '../auth/token';
import pubsub, { PubSubEvent } from '../misc/pub-sub';
import authModel from '../models/auth/auth';

const ws = {
  init(httpServer: http.Server) {
    const io = new Server(httpServer);
    io.setMaxListeners(1000);

    io.use(async (socket, next) => {
      const token = socket.handshake.query.token;

      try {
        socket.data._id = (await verifyToken(<string>token, TokenType.SESSION)).user.ID;
        socket.data.token = token;
        next();
      } catch (error: any) {
        next(error);
      }
    });

    io.on("connection", async socket => {
      console.log("socket connected:", socket.id);
      
      await authModel.setSocket(socket.data.userId, socket.id);
      pubsub.emit('ws.connected', { data: socket.id });

      socket.on('disconnect', async () => {
        console.log('socket disconnected:', socket.id);

        socket.offAny();

        await authModel.removeSocket(socket.data.userId);
        pubsub.emit('ws.disconnected', { data: socket.id });
      });

      socket.onAny((name: string, e: any, groups?: string[]) => {
        pubsub.emit(`ws.${name}`, { data: e , socket: socket.id , groups });
      });
    });

    pubsub.on('ws.out.*', publish);

    function publish(e: PubSubEvent) {
      if (!e.groups || e.groups.length === 0)
        io.emit(e.name!.slice(8), e.data);
      else
        io.to(e.groups).emit(e.name!.slice(8), e.data);
    }
  }
}

export default ws;