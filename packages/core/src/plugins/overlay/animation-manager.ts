type EasingFunction = (t: number) => number;

export interface AnimationCurve {
  name: string;
  easing: EasingFunction;
  icon: string;
}

export class AnimationManager {
  private isAnimating = false;
  private animationId: number | null = null;
  private animationStartTime = 0;
  private animationDurationMili = 4000;
  private animationSpeed = 1;
  private currentCurve: AnimationCurve;
  private onAnimationFrame?: (opacity: number, value: number) => void;

  private readonly animationCurves: AnimationCurve[] = [
    {
      name: "Linear",
      easing: (t: number) => t,
      icon: "—",
    },
    {
      name: "Sine",
      easing: (t: number) => (Math.sin(t * 2 * Math.PI - Math.PI / 2) + 1) / 2,
      icon: "∿",
    },
  ];

  constructor() {
    const defaultCurve = this.animationCurves.find(
      (curve) => curve.name === "Linear",
    );
    if (!defaultCurve) {
      throw new Error("Linear animation curve not found");
    }
    this.currentCurve = defaultCurve;
  }

  get curves(): AnimationCurve[] {
    return [...this.animationCurves];
  }

  get isRunning(): boolean {
    return this.isAnimating;
  }

  get speed(): number {
    return this.animationSpeed;
  }

  set speed(value: number) {
    this.animationSpeed = value;
  }

  get curve(): AnimationCurve {
    return this.currentCurve;
  }

  setCurve(curveName: string): boolean {
    const curve = this.animationCurves.find((c) => c.name === curveName);
    if (curve) {
      this.currentCurve = curve;
      return true;
    }
    return false;
  }

  start(onFrame: (opacity: number, value: number) => void): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.animationStartTime = performance.now();
    this.onAnimationFrame = onFrame;

    const animate = (currentTime: number) => {
      if (!this.isAnimating) return;

      const elapsed = currentTime - this.animationStartTime;
      const effectiveDuration =
        this.animationDurationMili / this.animationSpeed;
      let progress = elapsed / effectiveDuration;

      // Loop the animation
      if (progress >= 1) {
        progress = 0;
        this.animationStartTime = currentTime;
      }

      // Apply easing function
      const easedProgress = this.currentCurve.easing(progress);

      // Calculate opacity based on curve type
      let opacity: number;
      if (this.currentCurve.name === "Linear") {
        // Ping-pong logic for linear curves
        opacity =
          easedProgress <= 0.5 ? easedProgress * 2 : 2 - easedProgress * 2;
      } else if (this.currentCurve.name === "Sine") {
        // Sine wave already creates perfect 0->1->0 oscillation
        opacity = easedProgress;
      } else {
        // For complex curves, the easing function provides the full cycle
        opacity = easedProgress;
      }

      const value = Math.round(opacity * 100);

      if (this.onAnimationFrame) {
        this.onAnimationFrame(opacity, value);
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stop(): void {
    this.isAnimating = false;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
