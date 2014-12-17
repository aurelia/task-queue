import {TaskQueue} from '../src/index';

describe('task queue', () => {
  it('should have some tests', () => {
    var taskQueue = new TaskQueue();
    expect(taskQueue).toBe(taskQueue);
  });
});