import config from "./config";

// server and plugins
import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// misc
import http from 'http';
import path from 'path';
import { HttpError } from "./misc/errors";
import { HttpCode } from "./misc/http-codes";
import './cache';

// db
import oracle from './db/oracle';

// features
// import ws from './features/ws';
import sse from './features/sse';

// routes
import api from "./api";

(async () => {
  const app = express();
  const server = http.createServer(app);


  // ws.init(server);
  await oracle.connect();

  app.use(morgan('combined'));
  app.use(cors());
  app.use(helmet());
  
  app.use('/uploads', express.static(path.join(config.uploadsDir)));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/events', sse);
  app.use('/api', api);
  app.use('/health', (_, res) => res.send('OK'));

  app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    if (!err.code || err.code >= 500) {
      console.error(err.message);
      console.error(err.stack);
    }

    res
      .status(err.code || HttpCode.UNKNOWN_ERROR)
      .send(config.prod ? HttpCode[err.code] || "unknwonError" : err.message);
  });
  
  server.listen(config.port as number, '127.0.0.1', () => console.log('listening on port: ', config.port));

})();