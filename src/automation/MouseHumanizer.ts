/**
 * Mouse humanization with Bezier curves and natural delays
 */

export interface MouseMovement {
  x: number;
  y: number;
  duration: number;
}

export class MouseHumanizer {
  /**
   * Generate Bezier curve path for mouse movement
   */
  static generateBezierPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    steps = 50
  ): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [];
    
    // Add control points for natural curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Add some randomness to control points
    const randomOffsetX = (Math.random() - 0.5) * 100;
    const randomOffsetY = (Math.random() - 0.5) * 100;
    
    const cp1X = startX + (midX - startX) / 2 + randomOffsetX;
    const cp1Y = startY + (midY - startY) / 2 + randomOffsetY;
    const cp2X = midX + (endX - midX) / 2 + randomOffsetX;
    const cp2Y = midY + (endY - midY) / 2 + randomOffsetY;
    
    // Generate points along cubic Bezier curve
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const t2 = t * t;
      const t3 = t2 * t;
      
      const x = mt3 * startX + 3 * mt2 * t * cp1X + 3 * mt * t2 * cp2X + t3 * endX;
      const y = mt3 * startY + 3 * mt2 * t * cp1Y + 3 * mt * t2 * cp2Y + t3 * endY;
      
      // Add micro jitter (±1-2 pixels)
      const jitterX = (Math.random() - 0.5) * 2;
      const jitterY = (Math.random() - 0.5) * 2;
      
      path.push({
        x: Math.round(x + jitterX),
        y: Math.round(y + jitterY)
      });
    }
    
    return path;
  }

  /**
   * Generate random delay within range
   */
  static generateDelay(minMs: number, maxMs: number): number {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  /**
   * Add random pause at random points during movement
   */
  static shouldPause(): boolean {
    return Math.random() < 0.1; // 10% chance to pause
  }

  /**
   * Generate pause duration
   */
  static generatePauseDuration(): number {
    return this.generateDelay(50, 200);
  }

  /**
   * Simulate typing with occasional typos
   */
  static simulateTyping(text: string): { text: string; delays: number[] } {
    const delays: number[] = [];
    let resultText = text;
    
    for (let i = 0; i < text.length; i++) {
      // Random typing delay (50-150ms)
      delays.push(this.generateDelay(50, 150));
      
      // 2% chance of typo
      if (Math.random() < 0.02 && i < text.length - 1) {
        // Add wrong character then correct it
        delays.push(this.generateDelay(100, 300)); // Delay before correction
        delays.push(this.generateDelay(50, 100));  // Backspace delay
      }
    }
    
    return { text: resultText, delays };
  }

  /**
   * Calculate movement duration based on distance
   */
  static calculateDuration(distance: number): number {
    // Base duration on distance, with some randomness
    const baseDuration = Math.sqrt(distance) * 10;
    const variance = baseDuration * 0.3; // ±30% variance
    return Math.floor(baseDuration + (Math.random() - 0.5) * variance);
  }

  /**
   * Generate realistic mouse movement plan
   */
  static generateMovementPlan(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): MouseMovement[] {
    const path = this.generateBezierPath(startX, startY, endX, endY);
    const movements: MouseMovement[] = [];
    const totalDistance = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const totalDuration = this.calculateDuration(totalDistance);
    
    let accumulatedTime = 0;
    
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      const stepDuration = totalDuration / path.length;
      
      // Add pause occasionally
      if (i > 0 && i < path.length - 1 && this.shouldPause()) {
        accumulatedTime += this.generatePauseDuration();
      }
      
      movements.push({
        x: point.x,
        y: point.y,
        duration: Math.round(accumulatedTime + stepDuration * i)
      });
    }
    
    return movements;
  }
}
