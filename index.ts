import config from "./config";

import http from 'http';
import path from 'path';

import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// import misc
import { HttpError } from "./misc/errors";
import { HttpCode } from "./misc/http-codes";

// features
import oracle from './db/oracle';
import ws from './features/ws';
import sse from './features/sse';

// import apis
import api from "./api";

(async () => {
  const app = express();
  const server = http.createServer(app);


  ws.init(server);
  await oracle.connect();

  app.use(morgan('combined'));
  app.use(cors());
  app.use(helmet());

  app.use('/public', express.static(path.join(process.cwd(), 'public')));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/events', sse);
  app.use('/api', api);

  app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    if (!err.code || err.code >= 500) {
      console.error(err.message);
      console.error(err.stack);
    }

    res
      .status(err.code || HttpCode.UNKNOWN_ERROR)
      .send(
        err.code > 500
          ? config.prod ? HttpCode[err.code] : err.message
          : !err.code
            ? "unknwonError"
            : err.message
      );
  });

  server.listen(config.port, () => console.log('listening on port: ', config.port));

})();