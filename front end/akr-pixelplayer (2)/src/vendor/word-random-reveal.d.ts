import { gsap } from "gsap"
export { gsap }

export class SplitText {
  static create(target: HTMLElement, vars?: Record<string, any>): { lines: HTMLElement[]; revert: () => void }
  revert(): void
  lines: HTMLElement[]
}

export class ScrollTrigger {
  static registerPlugin(...plugins: any[]): void
}
