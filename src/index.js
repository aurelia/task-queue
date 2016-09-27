import {DOM, FEATURE} from 'aurelia-pal';

let hasSetImmediate = typeof setImmediate === 'function';

function makeRequestFlushFromMutationObserver(flush) {
  let toggle = 1;
  let observer = DOM.createMutationObserver(flush);
  let node = DOM.createTextNode('');
  observer.observe(node, {characterData: true});
  return function requestFlush() {
    toggle = -toggle;
    node.data = toggle;
  };
}

function makeRequestFlushFromTimer(flush) {
  return function requestFlush() {
    // We dispatch a timeout with a specified delay of 0 for engines that
    // can reliably accommodate that request. This will usually be snapped
    // to a 4 milisecond delay, but once we're flushing, there's no delay
    // between events.
    let timeoutHandle = setTimeout(handleFlushTimer, 0);
    // However, since this timer gets frequently dropped in Firefox
    // workers, we enlist an interval handle that will try to fire
    // an event 20 times per second until it succeeds.
    let intervalHandle = setInterval(handleFlushTimer, 50);
    function handleFlushTimer() {
      // Whichever timer succeeds will cancel both timers and request the
      // flush.
      clearTimeout(timeoutHandle);
      clearInterval(intervalHandle);
      flush();
    }
  };
}

function onError(error, task) {
  if ('onError' in task) {
    task.onError(error);
  } else if (hasSetImmediate) {
    setImmediate(() => { throw error; });
  } else {
    setTimeout(() => { throw error; }, 0);
  }
}

/**
* Either a Function or a class with a call method that will do work when dequeued.
*/
interface Task {
  /**
  * Call it.
  */
  call(): void;
}

/**
* Implements an asynchronous task queue.
*/
export class TaskQueue {
  /**
   * Whether the queue is in the process of flushing.
   */
  flushing = false;

  /**
  * Creates an instance of TaskQueue.
  */
  constructor() {
    this.microTaskQueue = [];
    this.microTaskQueueCapacity = 1024;
    this.taskQueue = [];

    if (FEATURE.mutationObserver) {
      this.requestFlushMicroTaskQueue = makeRequestFlushFromMutationObserver(() => this.flushMicroTaskQueue());
    } else {
      this.requestFlushMicroTaskQueue = makeRequestFlushFromTimer(() => this.flushMicroTaskQueue());
    }

    this.requestFlushTaskQueue = makeRequestFlushFromTimer(() => this.flushTaskQueue());
  }

  /**
  * Queues a task on the micro task queue for ASAP execution.
  * @param task The task to queue up for ASAP execution.
  */
  queueMicroTask(task: Task | Function): void {
    if (this.microTaskQueue.length < 1) {
      this.requestFlushMicroTaskQueue();
    }

    this.microTaskQueue.push(task);
  }

  /**
  * Queues a task on the macro task queue for turn-based execution.
  * @param task The task to queue up for turn-based execution.
  */
  queueTask(task: Task | Function): void {
    if (this.taskQueue.length < 1) {
      this.requestFlushTaskQueue();
    }

    this.taskQueue.push(task);
  }

  /**
  * Immediately flushes the task queue.
  */
  flushTaskQueue(): void {
    let queue = this.taskQueue;
    let index = 0;
    let task;

    this.taskQueue = []; //recursive calls to queueTask should be scheduled after the next cycle

    try {
      this.flushing = true;
      while (index < queue.length) {
        task = queue[index];
        task.call();
        index++;
      }
    } catch (error) {
      onError(error, task);
    } finally {
      this.flushing = false;
    }
  }

  /**
  * Immediately flushes the micro task queue.
  */
  flushMicroTaskQueue(): void {
    let queue = this.microTaskQueue;
    let capacity = this.microTaskQueueCapacity;
    let index = 0;
    let task;

    try {
      this.flushing = true;
      while (index < queue.length) {
        task = queue[index];
        task.call();
        index++;

        // Prevent leaking memory for long chains of recursive calls to `queueMicroTask`.
        // If we call `queueMicroTask` within a MicroTask scheduled by `queueMicroTask`, the queue will
        // grow, but to avoid an O(n) walk for every MicroTask we execute, we don't
        // shift MicroTasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 MicroTasks off the queue.
        if (index > capacity) {
          // Manually shift all values starting at the index back to the
          // beginning of the queue.
          for (let scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
            queue[scan] = queue[scan + index];
          }

          queue.length -= index;
          index = 0;
        }
      }
    } catch (error) {
      onError(error, task);
    } finally {
      this.flushing = false;
    }

    queue.length = 0;
  }
}
