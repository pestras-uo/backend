import EventEmitter from 'eventemitter2';

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

export interface PubSubEvent<T = any> {
  name?: string;
  toId?: number;
  socket?: string;
  groups?: number[];
  data?: T;
}

export default {
  on<T = any>(eventName: string, listener: (e: PubSubEvent<T>) => void) {
    eventEmitter.on(eventName, data => listener(data));
    return this;
  },

  once<T = any>(eventName: string, listener: (e: PubSubEvent<T>) => void) {
    eventEmitter.once(eventName, data => listener(data));
    return this;
  },

  emit<T = any>(event: string, e: PubSubEvent<T>) {
    e.name = event;
    eventEmitter.emit(event, e);
    return this;
  },

  emitMany<T = any>(events: string[], e: PubSubEvent<T>) {
    for (const event of events)
      this.emit(event, e);
  },

  off(namespace: string, listener: (e: PubSubEvent) => void) {
    eventEmitter.off(namespace, listener);
  },

  inGroups(e: PubSubEvent, groups: number[]) {
    if (!e.groups)
      return false;

    if (e.groups.includes(-1))
      return true;

    for (const group of e.groups)
      if (groups.includes(group))
        return true;
  }
};