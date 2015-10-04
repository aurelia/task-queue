import {TaskQueue} from '../src/index';
import {initialize} from 'aurelia-pal-browser';

describe('task queue', () => {

  beforeAll(() => initialize());

  it("does not provide immediate execution", () => {

    let count = 0;
    let task = () => count += 1;

    let queue = new TaskQueue();
    queue.queueTask(task);
    queue.queueTask(task);

    expect(count).toBe(0);

  });

  it("will execute tasks in the correct order", done => {
    let task1HasRun = false;
    let task1 = () => {
      task1HasRun = true;
    };
    let task2 = () => {
      expect(task1HasRun).toEqual(true);
      done();
    };

    let queue = new TaskQueue();
    queue.queueTask(task1);
    queue.queueTask(task2);
  });

  it("will use an onError handler on a task", done => {

    let count = 0;
    let task = () => {
      throw new Error("oops");
    };

    task.onError = (ex) => {
      expect(ex.message).toBe("oops");
      done();
    };

    let queue = new TaskQueue();
    queue.queueTask(task);

  });

});
