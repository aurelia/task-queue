import {TaskQueue} from '../src/index';
import {initialize} from 'aurelia-pal-browser';

describe('TaskQueue', () => {
  let sut;

  beforeAll(() => initialize());

  beforeEach(() => {
    sut = new TaskQueue();
  });

  it('queueTask does not provide immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueTask(task);
    sut.queueTask(task);

    expect(count).toBe(0);
  });

  it('flushTaskQueue provides immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueTask(task);
    sut.flushTaskQueue();

    expect(count).toBe(1);
  });

  it('flushTaskQueue does not affect microTaskQueue', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueMicroTask(task);
    sut.queueMicroTask(task);
    sut.flushTaskQueue();

    expect(count).toBe(0);
  });

  it('queueMicroTask does not provide immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueMicroTask(task);
    sut.queueMicroTask(task);

    expect(count).toBe(0);
  });

  it('flushMicroTaskQueue provides immediate execution', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueMicroTask(task);
    sut.flushMicroTaskQueue();

    expect(count).toBe(1);
  });

  it('flushMicroTaskQueue does not affect taskQueue', () => {
    let count = 0;
    let task = () => (count += 1);

    sut.queueTask(task);
    sut.queueTask(task);
    sut.flushMicroTaskQueue();

    expect(count).toBe(0);
  });

  it('will execute tasks in the correct order', done => {
    let task1HasRun = false;
    let task1 = () => {
      expect(sut.flushing).toBe(true);
      task1HasRun = true;
    };
    let task2 = () => {
      expect(sut.flushing).toBe(true);
      expect(task1HasRun).toBe(true);
      setTimeout(() => {
        expect(sut.flushing).toBe(false);
        done();
      });
    };

    expect(sut.flushing).toBe(false);
    sut.queueTask(task1);
    sut.queueTask(task2);
  });

  it('will use an onError handler on a task', done => {
    let task = () => {
      expect(sut.flushing).toBe(true);
      throw new Error('oops');
    };

    task.onError = ex => {
      expect(ex.message).toBe('oops');
      setTimeout(() => {
        expect(sut.flushing).toBe(false);
        done();
      });
    };

    expect(sut.flushing).toBe(false);
    sut.queueTask(task);
  });
});
