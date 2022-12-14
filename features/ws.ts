// import http from 'http';
// import { Server } from 'socket.io';
// import { verifyToken } from '../auth';
// import { TokenType } from '../auth/token';
// import { HttpError } from '../misc/errors';
// import { HttpCode } from '../misc/http-codes';
// import pubsub, { PubSubEvent } from '../misc/pub-sub';
// import authModel from '../models/auth/auth';

// const ws = {
//   init(httpServer: http.Server) {
//     const io = new Server(httpServer);
//     io.setMaxListeners(1000);

//     io.use(async (socket, next) => {
//       const token = socket.handshake.query.token;

//       if (!token)
//         return next(new HttpError(HttpCode.TOKEN_REQUIRED, "tokenIsRequired"));

//       try {
//         const tokenData = await verifyToken(<string>token, TokenType.SESSION);

//         if (!tokenData)
//           return next(new HttpError(HttpCode.INVALID_TOKEN, "invalidToken"));

//         socket.data._id = tokenData.user.id;
//         socket.data.token = token;
//         next();
//       } catch (error: any) {
//         next(error);
//       }
//     });

//     io.on("connection", async socket => {
//       console.log("socket connected:", socket.id);

//       await authModel.setSocket(socket.data.userId, socket.id);
//       pubsub.emit('ws.connected', { data: socket.id });

//       socket.on('disconnect', async () => {
//         console.log('socket disconnected:', socket.id);

//         socket.offAny();

//         await authModel.removeSocket(socket.data.userId);
//         pubsub.emit('ws.disconnected', { data: socket.id });
//       });

//       socket.onAny((name: string, e: any, groups?: string[]) => {
//         pubsub.emit(`ws.${name}`, { data: e, socket: socket.id, groups });
//       });
//     });

//     pubsub.on('ws.out.*', publish);

//     function publish(e: PubSubEvent) {
//       if (!e.groups || e.groups.length === 0)
//         io.emit(e.name!.slice(8), e.data);
//       else
//         io.to(e.groups).emit(e.name!.slice(8), e.data);
//     }
//   }
// }

// export default ws;