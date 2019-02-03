import {
  DOM,
  FEATURE
} from 'aurelia-pal';

/**
* Either a Function or a class with a call method that will do work when dequeued.
*/
export declare interface Task {
  
  /**
    * Call it.
    */
  call(): void;
}

/**
* Implements an asynchronous task queue.
*/
/**
* Implements an asynchronous task queue.
*/
export declare class TaskQueue {
  
  /**
     * Whether the queue is in the process of flushing.
     */
  flushing: any;
  
  /**
     * Enables long stack traces for queued tasks.
     */
  longStacks: any;
  
  /**
    * Creates an instance of TaskQueue.
    */
  constructor();
  
  /**
    * Queues a task on the micro task queue for ASAP execution.
    * @param task The task to queue up for ASAP execution.
    */
  queueMicroTask(task: Task | Function): void;
  
  /**
    * Queues a task on the macro task queue for turn-based execution.
    * @param task The task to queue up for turn-based execution.
    */
  queueTask(task: Task | Function): void;
  
  /**
    * Immediately flushes the task queue.
    */
  flushTaskQueue(): void;
  
  /**
    * Immediately flushes the micro task queue.
    */
  flushMicroTaskQueue(): void;
  prepareQueueStack(separator?: any): any;
}