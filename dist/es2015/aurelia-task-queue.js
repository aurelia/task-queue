import { DOM, FEATURE } from 'aurelia-pal';

let hasSetImmediate = typeof setImmediate === 'function';

function makeRequestFlushFromMutationObserver(flush) {
  let toggle = 1;
  let observer = DOM.createMutationObserver(flush);
  let node = DOM.createTextNode('');
  observer.observe(node, { characterData: true });
  return function requestFlush() {
    toggle = -toggle;
    node.data = toggle;
  };
}

function makeRequestFlushFromTimer(flush) {
  return function requestFlush() {
    let timeoutHandle = setTimeout(handleFlushTimer, 0);

    let intervalHandle = setInterval(handleFlushTimer, 50);
    function handleFlushTimer() {
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
    setImmediate(() => {
      throw error;
    });
  } else {
    setTimeout(() => {
      throw error;
    }, 0);
  }
}

export let TaskQueue = class TaskQueue {
  constructor() {
    this.flushing = false;

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

  queueMicroTask(task) {
    if (this.microTaskQueue.length < 1) {
      this.requestFlushMicroTaskQueue();
    }

    this.microTaskQueue.push(task);
  }

  queueTask(task) {
    if (this.taskQueue.length < 1) {
      this.requestFlushTaskQueue();
    }

    this.taskQueue.push(task);
  }

  flushTaskQueue() {
    let queue = this.taskQueue;
    let index = 0;
    let task;

    this.taskQueue = [];

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

  flushMicroTaskQueue() {
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

        if (index > capacity) {
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
};