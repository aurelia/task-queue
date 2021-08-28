import {DOM,FEATURE} from 'aurelia-pal';

const stackSeparator = '\nEnqueued in TaskQueue by:\n';
const microStackSeparator = '\nEnqueued in MicroTaskQueue by:\n';

function makeRequestFlushFromMutationObserver(flush) {
  let observer = DOM.createMutationObserver(flush);
  let val = 'a';
  let node = DOM.createTextNode('a');
  let values = Object.create(null);
  values.a = 'b';
  values.b = 'a';
  observer.observe(node, {characterData: true});
  return function requestFlush() {
    node.data = val = values[val];
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

function onError(error, task, longStacks) {
  if (longStacks &&
      task.stack &&
      typeof error === 'object' &&
      error !== null) {
    // Note: IE sets error.stack when throwing but does not override a defined .stack.
    error.stack = filterFlushStack(error.stack) + task.stack;
  }

  if ('onError' in task) {
    task.onError(error);
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
   * Enables long stack traces for queued tasks.
   */
  longStacks = false;

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
  * Immediately flushes the queue.
  * @param queue The task queue or micro task queue
  * @param capacity For periodically shift 1024 MicroTasks off the queue
  */
  _flushQueue(queue, capacity): void {
    let index = 0;
    let task;

    try {
      this.flushing = true;
      while (index < queue.length) {
        task = queue[index];
        if (this.longStacks) {
          this.stack = typeof task.stack === 'string' ? task.stack : undefined;
        }
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
      onError(error, task, this.longStacks);
    } finally {
      this.flushing = false;
    }
  }

  /**
  * Queues a task on the micro task queue for ASAP execution.
  * @param task The task to queue up for ASAP execution.
  */
  queueMicroTask(task: Task | Function): void {
    if (this.microTaskQueue.length < 1) {
      this.requestFlushMicroTaskQueue();
    }

    if (this.longStacks) {
      task.stack = this.prepareQueueStack(microStackSeparator);
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

    if (this.longStacks) {
      task.stack = this.prepareQueueStack(stackSeparator);
    }

    this.taskQueue.push(task);
  }

  /**
  * Immediately flushes the task queue.
  */
  flushTaskQueue(): void {
    let queue = this.taskQueue;
    this.taskQueue = []; //recursive calls to queueTask should be scheduled after the next cycle
    this._flushQueue(queue, Number.MAX_VALUE);
  }

  /**
  * Immediately flushes the micro task queue.
  */
  flushMicroTaskQueue(): void {
    let queue = this.microTaskQueue;
    this._flushQueue(queue, this.microTaskQueueCapacity);
    queue.length = 0;
  }

  prepareQueueStack(separator) {
    let stack = separator + filterQueueStack(captureStack());

    if (typeof this.stack === 'string') {
      stack = filterFlushStack(stack) + this.stack;
    }

    return stack;
  }
}

function captureStack() {
  let error = new Error();

  // Firefox, Chrome, Edge all have .stack defined by now, IE has not.
  if (error.stack) {
    return error.stack;
  }

  try {
    throw error;
  } catch (e) {
    return e.stack;
  }
}

function filterQueueStack(stack) {
  // Remove everything (error message + top stack frames) up to the topmost queueTask or queueMicroTask call
  return stack.replace(/^[\s\S]*?\bqueue(Micro)?Task\b[^\n]*\n/, '');
}

function filterFlushStack(stack) {
  // Remove bottom frames starting with the last flushTaskQueue or flushMicroTaskQueue
  let index = stack.lastIndexOf('flushMicroTaskQueue');

  if (index < 0) {
    index = stack.lastIndexOf('flushTaskQueue');
    if (index < 0) {
      return stack;
    }
  }

  index = stack.lastIndexOf('\n', index);

  return index < 0 ? stack : stack.substr(0, index);
  // The following would work but without regex support to match from end of string,
  // it's hard to ensure we have the last occurence of "flushTaskQueue".
  // return stack.replace(/\n[^\n]*?\bflush(Micro)?TaskQueue\b[\s\S]*$/, "");
}
