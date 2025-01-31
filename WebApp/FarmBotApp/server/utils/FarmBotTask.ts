/**
 * A class that represents a FarmBot task
 */
export class FarmBotTask { 
  task: () => Promise<void>; //the actual javascript function to be executed
  taskName: string; //the name of the task
  taskOwner: string; //the owner of the task
  onTaskComplete: () => Promise<void>
  createdAt: Date = new Date();   //the date the task was created

  constructor(task: () => Promise<void>, taskName: string, taskOwner: string, onTaskComplete: () => Promise<void>) {
    this.task = task;
    this.taskName = taskName;
    this.taskOwner = taskOwner;
    this.onTaskComplete = onTaskComplete;
  }

  sanitize() {
    const { task, onTaskComplete, ...sanitizedTask } = this;
    return sanitizedTask;
  }



  /**
   * Emits the current task to the client, but sanitized (excluding the javascript functions)
   
   */
  emit() {
    if (global.io) {

      let tmp = this.sanitize();
      tmp.startedAt = new Date();
      global.io.emit('farmbot-current-task', tmp);
    }
  }

}