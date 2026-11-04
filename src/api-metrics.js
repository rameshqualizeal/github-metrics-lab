/** Lightweight in-memory API metrics tracker (demo). */
export class ApiMetrics {
  #total = 0;
  #ok = 0;
  #clientErrors = 0;
  #serverErrors = 0;
  #totalMs = 0;

  /** Record one request with its HTTP status code and duration in milliseconds. */
  record(status, durationMs) {
    this.#total += 1;
    this.#totalMs += durationMs;
    if (status >= 200 && status < 300) this.#ok += 1;
    else if (status >= 400 && status < 500) this.#clientErrors += 1;
    else if (status >= 500 && status < 600) this.#serverErrors += 1;
  }

  snapshot() {
    return {
      totalRequests: this.#total,
      successful2xx: this.#ok,
      clientErrors4xx: this.#clientErrors,
      serverErrors5xx: this.#serverErrors,
      avgResponseMs: this.#total ? this.#totalMs / this.#total : 0,
    };
  }
}
