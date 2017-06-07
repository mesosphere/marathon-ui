var ExecutorUtil = {
  calculateExecutorId(task) {
    if (this.isDefaultExecutor(task.executor)) {
      return task.id;
    }
    return this.calculateLegacyExecutorId(task.id);

  },
  /* eslint-disable max-len */
  /**
   * pre-instance-era executorId="marathon-$taskId" and compatibility
   * reasons we need this calculation.
   * Should be removed as soon as no tasks without instance exists (tbd)
   *
   * @see https://github.com/mesosphere/marathon/blob/v1.5.1/src/main/scala/mesosphere/marathon/core/task/Task.scala#L241-L243
   *
   * @param {string} taskId
   * @returns {string} Executor ID for given Task ID
   */
   /* eslint-enable max-len */
  calculateLegacyExecutorId(taskId) {
    return "marathon-" + taskId;
  },

  isDefaultExecutor(executor) {
    return !executor || executor === "//cmd";
  }

};

export default ExecutorUtil;
