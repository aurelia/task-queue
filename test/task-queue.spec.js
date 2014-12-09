import {TaskQueue} from '../lib/index';

describe('task queue', () => {
  it('should have some tests', () => {
    var taskQueue = new TaskQueue();
    expect(taskQueue).toBe(taskQueue);
  });
});