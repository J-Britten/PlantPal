import { Queue } from "queue-typescript";

/**
 * Task queue queue for the FarmBot that emits the queue to the client
 */
export class CustomQueue<T> extends Queue<T> {

  constructor() {
      super();
  }

  enqueue(item: T): void {
      super.enqueue(item);   
      emitQueue();

  }

  dequeue(): T {
      const item = super.dequeue();
      emitQueue();
      return item!;
  }
}

/**
 * Emits the current task queue to the client, but sanitized (excluding the javascript functions)
 * 
 */
export function emitQueue() {
    if(global.io) {
        const sanitizedQueue = global.FarmBotTaskQueue.toArray().map(task => task.sanitize());
        global.io.emit('farmbot-task-queue', sanitizedQueue);
    }
}