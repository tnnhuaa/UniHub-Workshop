type CircuitState = 'closed' | 'open' | 'half-open';

type CircuitBreakerOptions = {
  failureThreshold: number;
  openDurationMs: number;
};

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private openedAt: number | null = null;

  constructor(private readonly options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (this.openedAt && now - this.openedAt >= this.options.openDurationMs) {
        this.state = 'half-open';
      } else {
        throw new Error('CIRCUIT_OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
    this.openedAt = null;
  }

  private onFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }
}

export type { CircuitBreakerOptions };
