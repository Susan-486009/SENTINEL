import { logStructured } from './catastrophicLogger.js';

export class CircuitBreaker {
  constructor(actionName, options = {}) {
    this.actionName = actionName;
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs || 30000; // 30s
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastStateChange = Date.now();
  }

  async execute(asyncFunction, fallbackValue = null) {
    if (this.state === 'OPEN') {
      const timeSinceOpen = Date.now() - this.lastStateChange;
      if (timeSinceOpen > this.recoveryTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.lastStateChange = Date.now();
        logStructured({
          level: 'WARN',
          message: `Circuit Breaker [${this.actionName}] entered HALF_OPEN. Probing dependency recovery…`
        });
      } else {
        logStructured({
          level: 'WARN',
          message: `Circuit Breaker [${this.actionName}] is OPEN. Executing fallback bypass.`
        });
        if (fallbackValue) return fallbackValue;
        throw new Error(`Circuit Breaker [${this.actionName}] is OPEN. Target service bypassed.`);
      }
    }

    try {
      // Execute the actual function
      const result = await asyncFunction();
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastStateChange = Date.now();
        logStructured({
          level: 'INFO',
          message: `Circuit Breaker [${this.actionName}] successfully recovered and entered CLOSED.`
        });
      }
      return result;
    } catch (err) {
      this.failureCount++;
      logStructured({
        level: 'WARN',
        message: `Circuit Breaker [${this.actionName}] recorded failure (${this.failureCount}/${this.failureThreshold})`,
        error: err
      });

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        this.lastStateChange = Date.now();
        logStructured({
          level: 'CRITICAL',
          message: `Circuit Breaker [${this.actionName}] TRIPPED. State changed to OPEN.`
        });
      }
      
      if (fallbackValue) return fallbackValue;
      throw err;
    }
  }
}
