declare module 'aurelia-task-queue' {
  import { DOM }  from 'aurelia-pal';
  export interface Callable {
    call(): void;
  }
  export class TaskQueue {
    constructor();
    queueMicroTask(task: Callable | Function): void;
    queueTask(task: Callable | Function): void;
    flushTaskQueue(): void;
    flushMicroTaskQueue(): void;
  }
}