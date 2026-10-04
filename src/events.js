import { EventEmitter } from 'node:events';

/**
 * In-process event bus. Core modules emit facts ("a lead was created", "a contact replied");
 * automation listens and decides what to do (stage moves, campaigns, AI follow-up).
 */
export const bus = new EventEmitter();
bus.setMaxListeners(50);

export function emit(event, payload) {
  // Listeners may be async; never let an automation failure break the request that triggered it.
  for (const listener of bus.listeners(event)) {
    Promise.resolve()
      .then(() => listener(payload))
      .catch((err) => console.error(`[automation] ${event} listener failed:`, err));
  }
}
