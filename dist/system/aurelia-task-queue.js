'use strict';

System.register(['aurelia-pal'], function (_export, _context) {
  "use strict";

  var DOM, FEATURE, _typeof, stackSeparator, microStackSeparator, TaskQueue;

  

  function makeRequestFlushFromMutationObserver(flush) {
    var observer = DOM.createMutationObserver(flush);
    var val = 'a';
    var node = DOM.createTextNode('a');
    var values = Object.create(null);
    values.a = 'b';
    values.b = 'a';
    observer.observe(node, { characterData: true });
    return function requestFlush() {
      node.data = val = values[val];
    };
  }

  function makeRequestFlushFromTimer(flush) {
    return function requestFlush() {
      var timeoutHandle = setTimeout(handleFlushTimer, 0);

      var intervalHandle = setInterval(handleFlushTimer, 50);
      function handleFlushTimer() {
        clearTimeout(timeoutHandle);
        clearInterval(intervalHandle);
        flush();
      }
    };
  }

  function onError(error, task, longStacks) {
    if (longStacks && task.stack && (typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && error !== null) {
      error.stack = filterFlushStack(error.stack) + task.stack;
    }

    if ('onError' in task) {
      task.onError(error);
    } else {
      setTimeout(function () {
        throw error;
      }, 0);
    }
  }

  function captureStack() {
    var error = new Error();

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
    return stack.replace(/^[\s\S]*?\bqueue(Micro)?Task\b[^\n]*\n/, '');
  }

  function filterFlushStack(stack) {
    var index = stack.lastIndexOf('flushMicroTaskQueue');

    if (index < 0) {
      index = stack.lastIndexOf('flushTaskQueue');
      if (index < 0) {
        return stack;
      }
    }

    index = stack.lastIndexOf('\n', index);

    return index < 0 ? stack : stack.substr(0, index);
  }
  return {
    setters: [function (_aureliaPal) {
      DOM = _aureliaPal.DOM;
      FEATURE = _aureliaPal.FEATURE;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
      stackSeparator = '\nEnqueued in TaskQueue by:\n';
      microStackSeparator = '\nEnqueued in MicroTaskQueue by:\n';

      _export('TaskQueue', TaskQueue = function () {
        function TaskQueue() {
          var _this = this;

          

          this.flushing = false;
          this.longStacks = false;

          this.microTaskQueue = [];
          this.microTaskQueueCapacity = 1024;
          this.taskQueue = [];

          if (FEATURE.mutationObserver) {
            this.requestFlushMicroTaskQueue = makeRequestFlushFromMutationObserver(function () {
              return _this.flushMicroTaskQueue();
            });
          } else {
            this.requestFlushMicroTaskQueue = makeRequestFlushFromTimer(function () {
              return _this.flushMicroTaskQueue();
            });
          }

          this.requestFlushTaskQueue = makeRequestFlushFromTimer(function () {
            return _this.flushTaskQueue();
          });
        }

        TaskQueue.prototype._flushQueue = function _flushQueue(queue, capacity) {
          var index = 0;
          var task = void 0;

          try {
            this.flushing = true;
            while (index < queue.length) {
              task = queue[index];
              if (this.longStacks) {
                this.stack = typeof task.stack === 'string' ? task.stack : undefined;
              }
              task.call();
              index++;

              if (index > capacity) {
                for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
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
        };

        TaskQueue.prototype.queueMicroTask = function queueMicroTask(task) {
          if (this.microTaskQueue.length < 1) {
            this.requestFlushMicroTaskQueue();
          }

          if (this.longStacks) {
            task.stack = this.prepareQueueStack(microStackSeparator);
          }

          this.microTaskQueue.push(task);
        };

        TaskQueue.prototype.queueTask = function queueTask(task) {
          if (this.taskQueue.length < 1) {
            this.requestFlushTaskQueue();
          }

          if (this.longStacks) {
            task.stack = this.prepareQueueStack(stackSeparator);
          }

          this.taskQueue.push(task);
        };

        TaskQueue.prototype.flushTaskQueue = function flushTaskQueue() {
          var queue = this.taskQueue;
          this.taskQueue = [];
          this._flushQueue(queue, Number.MAX_VALUE);
        };

        TaskQueue.prototype.flushMicroTaskQueue = function flushMicroTaskQueue() {
          var queue = this.microTaskQueue;
          this._flushQueue(queue, this.microTaskQueueCapacity);
          queue.length = 0;
        };

        TaskQueue.prototype.prepareQueueStack = function prepareQueueStack(separator) {
          var stack = separator + filterQueueStack(captureStack());

          if (typeof this.stack === 'string') {
            stack = filterFlushStack(stack) + this.stack;
          }

          return stack;
        };

        return TaskQueue;
      }());

      _export('TaskQueue', TaskQueue);
    }
  };
});