import { Request, Response, Router } from "express";
import { UserSession } from "../auth";
import auth from "../middlewares/auth";
import pubSub from '../misc/pub-sub';
import { Action } from '../auth/roles/actions';

interface SSEData {
  action: Action;
  entities_ids: string[];
  issuer: string;
  orgunit: string;
}

const connected = new Map<string, Response<any, UserSession>>();

function sse(req: Request, res: Response<any, UserSession>) {
  res.set('Content-Type', 'text/event-stream;charset=utf-8');
  res.set('Cache-Control', 'no-cache');

  connected.set(res.locals.user.id, res);

  req.on('close', () => {
    console.log("sse connection closed:", res.locals?.session?.TOKEN);
    connected.delete(res.locals.user.id);
  });
}

pubSub.on('publish', e => {
  const data: SSEData = {
    action: e.action,
    entities_ids: e.entities_ids,
    issuer: e.issuer,
    orgunit: e.orgunit
  }

  for (const res of connected.values())
    if (
      (
        res.locals.user.id !== e.issuer &&
        pubSub.inGroups(e, res.locals.user.groups.map(g => g.id)) && 
        pubSub.inRoles(e, res.locals.user.roles)
      ) || res.locals.user.id === e.to_id
    )
      send(res, data);
});

export default Router()
  .get('', auth(), sse);

function send(res: Response, data: SSEData) {
  res.write('event: sse\n');
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}