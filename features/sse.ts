import { Request, Response, Router } from "express";
import { UserSession } from "../auth";
import auth from "../middlewares/auth";
import { HttpCode } from "../misc/http-codes";
import pubSub from '../misc/pub-sub';

const connected = new Map<string, Response<any, UserSession>>();

function sse(req: Request, res: Response<any, UserSession>) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };

  res.writeHead(HttpCode.OK, headers);

  connected.set(res.locals.user.id, res);

  req.on('close', () => {
    console.log("sse connection closed:", res.locals?.session?.TOKEN);
    connected.delete(res.locals.user.id);
  });
}

pubSub.on('sse.message', e => {
  if (e.toId) {
    if (connected.has(e.toId))
      connected.get(e.toId)?.json(e.data);

  } else if (e.groups?.length) {
    for (const res of connected.values())
      if (pubSub.inGroups(e, res.locals.user.groups))
        res.json(e.data);

  } else {
    for (const res of connected.values())
      res.json(e.data);
  }
});

export default Router()
  .get('', auth(), sse);