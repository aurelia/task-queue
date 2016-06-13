'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aureliaTaskQueue = require('./aurelia-task-queue');

Object.keys(_aureliaTaskQueue).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _aureliaTaskQueue[key];
    }
  });
});