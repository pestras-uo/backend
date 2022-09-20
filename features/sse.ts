import { Request, Response, Router } from "express";
import { ResLocals } from "../auth/interfaces";
import auth from "../middlewares/auth";
import { HttpCode } from "../misc/http-codes";
import pubSub from '../misc/pub-sub';

const connected = new Map<string, Response<any, ResLocals>>();

function sse(req: Request, res: Response<any, ResLocals>) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };

  res.writeHead(HttpCode.OK, headers);

  connected.set(res.locals.user.ID, res);

  req.on('close', () => {
    console.log("sse connection closed:", res.locals?.session?.TOKEN);
    connected.delete(res.locals.user.ID);
  });
}

pubSub.on('sse.message', e => {
  if (e.toId) {
    if (connected.has(e.toId))
      connected.get(e.toId)?.json(e.data);

  } else if (e.groups?.length) {
    for (const res of connected.values())
      if (pubSub.inGroups(e, res.locals.user.GROUPS))
        res.json(e.data);

  } else {
    for (const res of connected.values())
      res.json(e.data);
  }
});

export default Router()
  .get('', auth(), sse);