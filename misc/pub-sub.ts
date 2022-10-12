import EventEmitter from 'eventemitter2';
import { Action } from '../auth/roles/actions';

const eventEmitter = new EventEmitter({
  // set this to `true` to use wildcards
  wildcard: true,
  // the delimiter used to segment namespaces
  delimiter: '.', 
  // set this to `true` if you want to emit the newListener event
  newListener: false,
  // set this to `true` if you want to emit the removeListener event
  removeListener: false,
  // the maximum amount of listeners that can be assigned to an event
  maxListeners: 10000,
  // show event name in memory leak message when more than maximum amount of listeners is assigned
  verboseMemoryLeak: true,
  // disable throwing uncaughtException if an error event is emitted and it has no listeners
  ignoreErrors: false
});

export interface PubSubEvent {
  action: Action;
  to_id?: string;
  groups?: string[];
  roles?: number[];
  issuer: string;
  orgunit?: string;
  entities_ids?: string[];
}

export default {
  on(eventName: string, listener: (e: PubSubEvent) => void) {
    eventEmitter.on(eventName, data => listener(data));
    return this;
  },

  once(eventName: string, listener: (e: PubSubEvent) => void) {
    eventEmitter.once(eventName, data => listener(data));
    return this;
  },

  emit(event: string, e: PubSubEvent) {
    eventEmitter.emit(event, e);
    return this;
  },

  emitMany(events: string[], e: PubSubEvent) {
    for (const event of events)
      this.emit(event, e);
  },

  off(namespace: string, listener: (e: PubSubEvent) => void) {
    eventEmitter.off(namespace, listener);
  },

  inGroups(e: PubSubEvent, groups: string[]) {
    if (!e.groups)
      return true;

    for (const group of e.groups)
      if (groups.includes(group))
        return true;
  },

  inRoles(e: PubSubEvent, roles: number[]) {
    if (!e.roles)
      return true;

    for (const role of e.roles)
      if (roles.includes(role))
        return true;
  }
};