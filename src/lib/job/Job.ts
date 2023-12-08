export interface JobOptions {
  useInterval: boolean;
  intervalMs?: number;
  runAtStart: boolean;
}

export abstract class Job {
  private useInterval: boolean;
  private interval: NodeJS.Timeout;
  private intervalMs?: number;
  private runAtStart: boolean;

  constructor(options: JobOptions) {
    this.useInterval = options.useInterval;
    this.runAtStart = options.runAtStart;
    this.intervalMs = options.intervalMs;
    if (this.useInterval && !this.intervalMs) {
      throw new Error('Interval is required when useInterval is true');
    }
  }

  public start() {
    if (this.useInterval) {
      this.interval = setInterval(this.execute.bind(this), this.intervalMs);
    }
    if (this.runAtStart) {
      this.execute();
    }
  }

  public stop() {
    clearInterval(this.interval);
  }

  protected abstract execute(): Promise<void> | void;
}