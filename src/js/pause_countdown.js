// js/pause_countdown.js
export class PauseCountdown {
  /**
   * @param {Object} opts
   * @param {(id:string)=>HTMLElement|null} [opts.getElement]
   * @param {number} [opts.limit]                    // seconds
   * @param {string} [opts.overlayId]                // DOM id for overlay container
   * @param {string} [opts.counterId]                // DOM id for countdown number
   */
  constructor({
    getElement = (id) => document.getElementById(id),
    limit = 30,
    overlayId = 'pause-overlay',
    counterId = 'pause-countdown',
  } = {}) {
    this.getElement = getElement;
    this.overlayId = overlayId;
    this.counterId = counterId;

    // public-ish state
    this.limit = Number(limit) || 10;
    this.remaining = this.limit;
    this.timerId = null;
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  setLimit(seconds) {
    const s = Math.max(1, Number(seconds) || this.limit);
    this.limit = s;
    // If active, update remaining + UI immediately
    if (this.running) {
      this.remaining = s;
      this.#render();
    } else {
      this.remaining = s;
    }
  }

  start(onFinish) {
    if (this.running) this.cancel(); // safety
    this.running = true;
    this.remaining = this.limit;
    this.onFinish = onFinish;

    this.#show();
    this.#render();

    this.timerId = setInterval(() => {
      this.remaining -= 1;
      this.#render();
      if (this.remaining <= 0) {
        this.#finish();
      }
    }, 1000);
  }

  cancel() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
    this.running = false;
    this.remaining = this.limit;
    this.#hide();
  }

  // ---- private helpers ----
  #show() {
    const overlay = this.getElement(this.overlayId);
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
  }

  #hide() {
    const overlay = this.getElement(this.overlayId);
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }

  #render() {
    const counter = this.getElement(this.counterId);
    if (counter) counter.textContent = String(Math.max(0, this.remaining));
  }

  #finish() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
    this.running = false;
    this.remaining = this.limit;
    this.#hide();
    if (typeof this.onFinish === 'function') this.onFinish();
  }
}
