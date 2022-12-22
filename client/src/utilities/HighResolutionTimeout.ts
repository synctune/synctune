/**
 * An alternate implementation of setTimeout that attempts to mitigate the
 * potential issues of the setTimeout callback not being called exactly when
 * the timeout is described due to the "best effort" resolution of events on
 * the JavaScript event loop. This is done by flooding the event loop with
 * intermediary callbacks that keep checking the elapsed time until we reach
 * the timeout duration. Additionally, if an overshoot still happens the
 * overshoot value will be passed into the callback as a parameter, allowing
 * the callback to compensate for it if needed.
 *
 * Note: HighResolutionTimeout should be used sparingly because having multiple
 * of these running at once can lead to delays in the event loop callbacks.
 */
export default class HighResolutionTimeout {
  private duration: number;
  private tickDuration: number;
  private callback: (overshoot: number) => unknown;

  private startTime: number | undefined;
  private currentTime: number | undefined;
  private timerId: number | undefined;

  constructor(duration: number, callback: (overshoot: number) => unknown) {
    this.duration = duration;
    this.callback = callback;

    this.tickDuration = 1;
  }

  private runTick() {
    this.currentTime = Date.now();

    // If we're just starting
    if (!this.startTime) {
      this.startTime = this.currentTime;
    }

    const deltaTime = this.currentTime - this.startTime;

    // We've hit our target duration (or overshot it a bit)
    if (deltaTime >= this.duration) {
      const overshoot = deltaTime - this.duration;
      this.callback(overshoot);
      return;
    }

    this.timerId = setTimeout(() => {
      this.runTick();
    }, this.tickDuration);
  }

  /**
   * Starts the high resolution timeout.
   */
  public start() {
    this.runTick();
  }

  /**
   * Cancels the high resolution timeout if it is currently running.
   */
  public cancel() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
  }
}
