System.register([], function (_export) {
  var _prototypeProperties, _classCallCheck, BrowserMutationObserver, hasSetImmediate, TaskQueue;

  function makeRequestFlushFromMutationObserver(flush) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode("");
    observer.observe(node, { characterData: true });
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
      var timeoutHandle = setTimeout(handleFlushTimer, 0);
      // However, since this timer gets frequently dropped in Firefox
      // workers, we enlist an interval handle that will try to fire
      // an event 20 times per second until it succeeds.
      var intervalHandle = setInterval(handleFlushTimer, 50);
      function handleFlushTimer() {
        // Whichever timer succeeds will cancel both timers and request the
        // flush.
        clearTimeout(timeoutHandle);
        clearInterval(intervalHandle);
        flush();
      }
    };
  }

  return {
    setters: [],
    execute: function () {
      "use strict";

      _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

      BrowserMutationObserver = window.MutationObserver || window.WebKitMutationObserver;
      hasSetImmediate = typeof setImmediate === "function";
      TaskQueue = _export("TaskQueue", (function () {
        function TaskQueue() {
          var _this = this;

          _classCallCheck(this, TaskQueue);

          this.microTaskQueue = [];
          this.microTaskQueueCapacity = 1024;
          this.taskQueue = [];

          if (typeof BrowserMutationObserver === "function") {
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

        _prototypeProperties(TaskQueue, null, {
          queueMicroTask: {
            value: function queueMicroTask(task) {
              if (this.microTaskQueue.length < 1) {
                this.requestFlushMicroTaskQueue();
              }

              this.microTaskQueue.push(task);
            },
            writable: true,
            configurable: true
          },
          queueTask: {
            value: function queueTask(task) {
              if (this.taskQueue.length < 1) {
                this.requestFlushTaskQueue();
              }

              this.taskQueue.push(task);
            },
            writable: true,
            configurable: true
          },
          flushTaskQueue: {
            value: function flushTaskQueue() {
              var queue = this.taskQueue,
                  index = 0,
                  task;

              this.taskQueue = []; //recursive calls to queueTask should be scheduled after the next cycle

              while (index < queue.length) {
                task = queue[index];

                try {
                  task.call();
                } catch (error) {
                  this.onError(error, task);
                }

                index++;
              }
            },
            writable: true,
            configurable: true
          },
          flushMicroTaskQueue: {
            value: function flushMicroTaskQueue() {
              var queue = this.microTaskQueue,
                  capacity = this.microTaskQueueCapacity,
                  index = 0,
                  task;

              while (index < queue.length) {
                task = queue[index];

                try {
                  task.call();
                } catch (error) {
                  this.onError(error, task);
                }

                index++;

                // Prevent leaking memory for long chains of recursive calls to `queueMicroTask`.
                // If we call `queueMicroTask` within a MicroTask scheduled by `queueMicroTask`, the queue will
                // grow, but to avoid an O(n) walk for every MicroTask we execute, we don't
                // shift MicroTasks off the queue after they have been executed.
                // Instead, we periodically shift 1024 MicroTasks off the queue.
                if (index > capacity) {
                  // Manually shift all values starting at the index back to the
                  // beginning of the queue.
                  for (var scan = 0; scan < index; scan++) {
                    queue[scan] = queue[scan + index];
                  }

                  queue.length -= index;
                  index = 0;
                }
              }

              queue.length = 0;
            },
            writable: true,
            configurable: true
          },
          onError: {
            value: function onError(error, task) {
              if ("onError" in task) {
                task.onError(error);
              } else if (hasSetImmediate) {
                setImmediate(function () {
                  throw error;
                });
              } else {
                setTimeout(function () {
                  throw error;
                }, 0);
              }
            },
            writable: true,
            configurable: true
          }
        });

        return TaskQueue;
      })());
    }
  };
});