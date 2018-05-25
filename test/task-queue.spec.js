import {TaskQueue, queuePriority} from '../src/index';
import {initialize} from 'aurelia-pal-browser';

describe('task queue', () => {
  beforeAll(() => initialize());

  it('does not provide immediate execution', () => {
    let count = 0;
    let task = () => count += 1;

    let queue = new TaskQueue();
    queue.queueTask(task);
    queue.queueTask(task);

    expect(count).toBe(0);
  });

  it('will execute tasks in the correct order', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueTask(task1);
    queue.queueTask(task2);
  });

  it('will execute nested queued tasks in the next cycle', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let task2HasRun = false;
    let task3HasRun = false;

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
      queue.queueTask(task3);
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      task2HasRun = true;
      queue.queueTask(task4);

      queue.queueMicroTask(() => {
        expect(task3HasRun).toEqual(false);
      });
    };

    let task3 = () => {
      expect(queue.flushing).toBe(true);
      expect(task2HasRun).toEqual(true);
      task3HasRun = true;
    };

    let task4 = () => {
      expect(queue.flushing).toBe(true);
      expect(task3HasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueTask(task1);
    queue.queueTask(task2);
  });

  it('will use an onError handler on a task', done => {
    let queue = new TaskQueue();
    let task = () => {
      expect(queue.flushing).toBe(true);
      throw new Error('oops');
    };

    task.onError = (ex) => {
      expect(ex.message).toBe('oops');
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueTask(task);
  });
});

describe('micro task queue', () => {
  beforeAll(() => initialize());

  it('does not provide immediate execution', () => {
    let count = 0;
    let task = () => count += 1;

    let queue = new TaskQueue();
    queue.queueMicroTask(task);
    queue.queueMicroTask(task);

    expect(count).toBe(0);
  });

  it('will execute tasks in the correct order, before setTimeout', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let task2HasRun = false;

    setTimeout(() => {
      expect(task2HasRun).toEqual(true);
      expect(queue.flushing).toBe(false);
      done();
    });

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
    };
    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      task2HasRun = true;
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task1);
    queue.queueMicroTask(task2);
  });

  it('will execute nested queued tasks in the same queue, before setTimeout', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let task2HasRun = false;
    let task3HasRun = false;
    let task4HasRun = false;

    setTimeout(() => {
      expect(task4HasRun).toBe(true);
      expect(queue.flushing).toBe(false);
      done();
    });

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
      queue.queueMicroTask(task3);
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      task2HasRun = true;
      queue.queueMicroTask(task4);
    };

    let task3 = () => {
      expect(queue.flushing).toBe(true);
      expect(task2HasRun).toEqual(true);
      task3HasRun = true;
    };

    let task4 = () => {
      expect(queue.flushing).toBe(true);
      expect(task3HasRun).toEqual(true);
      task4HasRun = true;
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task1);
    queue.queueMicroTask(task2);
  });

  it('will use an onError handler on a task', done => {
    let queue = new TaskQueue();
    let task = () => {
      expect(queue.flushing).toBe(true);
      throw new Error('oops');
    };

    task.onError = (ex) => {
      expect(ex.message).toBe('oops');
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task);
  });

  it('will execute high priority micro task first', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let taskPHasRun = false;

    let taskP = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      taskPHasRun = true;
    };

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
      queue.queueMicroTask(taskP, queuePriority.high);
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(taskPHasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    queue.queueMicroTask(task1);
    queue.queueMicroTask(task2);
    expect(queue.flushing).toBe(false);
  });

  it('will execute high priority micro tasks in right order', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let taskP1HasRun = false;
    let taskP2HasRun = false;

    let taskP1 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      taskP1HasRun = true;
    };

    let taskP2 = () => {
      expect(queue.flushing).toBe(true);
      expect(taskP1HasRun).toEqual(true);
      taskP2HasRun = true;
    };

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
      queue.queueMicroTask(taskP1, queuePriority.high);
      queue.queueMicroTask(taskP2, queuePriority.high);
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(taskP2HasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task1);
    queue.queueMicroTask(task2);
  });

  it('will execute nested high priority tasks in right order', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let taskP1HasRun = false;
    let taskP2HasRun = false;

    let taskP1 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      taskP1HasRun = true;
      queue.queueMicroTask(taskP2, queuePriority.high);
    };

    let taskP2 = () => {
      expect(queue.flushing).toBe(true);
      expect(taskP1HasRun).toEqual(true);
      taskP2HasRun = true;
    };

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
      queue.queueMicroTask(taskP1, queuePriority.high);
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(taskP2HasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task1);
    queue.queueMicroTask(task2);
  });

  it('will execute mixed high priority and normal tasks in right order', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let taskP1HasRun = false;
    let task2HasRun = false;

    let taskP1 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      taskP1HasRun = true;
      queue.queueMicroTask(task3);
    };

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
      queue.queueMicroTask(taskP1, queuePriority.high);
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(taskP1HasRun).toEqual(true);
      task2HasRun = true;
    };

    let task3 = () => {
      expect(queue.flushing).toBe(true);
      expect(task2HasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task1);
    queue.queueMicroTask(task2);
  });

  it('will execute high priority tasks, when flushing empty micro task queue', done => {
    let queue = new TaskQueue();
    let taskP1HasRun = false;

    let taskP1 = () => {
      expect(queue.flushing).toBe(true);
      taskP1HasRun = true;
    };

    let taskP2 = () => {
      expect(queue.flushing).toBe(true);
      expect(taskP1HasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    queue.queueMicroTask(taskP1, queuePriority.high);
    queue.queueMicroTask(taskP2, queuePriority.high);
    expect(queue.flushing).toBe(false);
  });

  it('will execute nested high priority tasks, when flushing last micro task', done => {
    let queue = new TaskQueue();
    let task1HasRun = false;
    let task2HasRun = false;

    let taskP = () => {
      expect(queue.flushing).toBe(true);
      expect(task2HasRun).toEqual(true);
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    let task1 = () => {
      expect(queue.flushing).toBe(true);
      task1HasRun = true;
    };

    let task2 = () => {
      expect(queue.flushing).toBe(true);
      expect(task1HasRun).toEqual(true);
      task2HasRun = true;
      queue.queueMicroTask(taskP, queuePriority.high);
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task1);
    queue.queueMicroTask(task2);
  });

  it('will use an onError handler on a high priority task', done => {
    let queue = new TaskQueue();
    let task = () => {
      expect(queue.flushing).toBe(true);
      throw new Error('oops');
    };

    task.onError = (ex) => {
      expect(ex.message).toBe('oops');
      setTimeout(() => {
        expect(queue.flushing).toBe(false);
        done();
      });
    };

    expect(queue.flushing).toBe(false);
    queue.queueMicroTask(task, queuePriority.high);
  });
});
