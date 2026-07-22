import React, { useRef, useEffect, useState } from "react"
import { animate } from "framer-motion"
import { gsap, SplitText, ScrollTrigger } from "./vendor/word-random-reveal.js"

gsap.registerPlugin(SplitText, ScrollTrigger)

interface BlindsTextRevealProps {
  text?: string
  color?: string
  blindsColor?: string
  font?: Record<string, any>
  tag?: string
  className?: string
  style?: Record<string, any>
  staggerAmount?: number
  transition?: Record<string, any>
  trigger?: string
  reverse?: boolean
  scrollTriggerPosition?: string
  direction?: string
  lineOrder?: string
  alternate?: boolean
  animationMode?: string
  transitionIn?: Record<string, any>
}

export default function BlindsTextReveal(props: BlindsTextRevealProps) {
  const {
    text = "Here's a text reveal with blinds. Each line is covered and then revealed.",
    color = "#ffffff",
    blindsColor = "#8B5CF6",
    font = {},
    tag = "h1",
    className = "",
    style = {},
    staggerAmount = 0.1,
    transition = { type: "tween", duration: 0.6, ease: "easeOut", delay: 0 },
    trigger = "Appear",
    reverse = false,
    scrollTriggerPosition = "center",
    direction = "left-to-right",
    lineOrder = "first-to-last",
    alternate = false,
    animationMode = "out",
    transitionIn = { type: "tween", duration: 0.5, ease: "easeIn", delay: 0 },
  } = props

  const textRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationControlsRef = useRef<any[]>([])
  const hasAnimatedRef = useRef(false)
  const lineSplitRef = useRef<any>(null)
  const blindElementsRef = useRef<HTMLElement[]>([])
  const lineElementsRef = useRef<HTMLElement[]>([])
  const resizeTimeoutRef = useRef<any>(null)
  const isFirstResizeRef = useRef(true)
  const [isInView, setIsInView] = useState(false)
  const [isOutOfView, setIsOutOfView] = useState(false)

  const TAG = tag as React.ElementType

  const getTransformOrigin = (dir: string) => {
    switch (dir) {
      case "left-to-right":
        return "left center"
      case "right-to-left":
        return "right center"
      case "top-to-bottom":
        return "center top"
      case "bottom-to-top":
        return "center bottom"
      default:
        return "left center"
    }
  }

  const getBlindTransform = (progress: number, dir: string) => {
    const end = 101
    switch (dir) {
      case "left-to-right":
        return `translateX(${-end * progress}%)`
      case "right-to-left":
        return `translateX(${end * progress}%)`
      case "top-to-bottom":
        return `translateY(${-end * progress}%)`
      case "bottom-to-top":
        return `translateY(${end * progress}%)`
      default:
        return `translateX(${-end * progress}%)`
    }
  }

  const getInitialTransform = (dir: string) => getBlindTransform(0, dir)
  const getRevealedTransform = (dir: string) => getBlindTransform(1, dir)

  const getBlindInStartTransform = (dir: string) => {
    switch (dir) {
      case "left-to-right":
        return "translateX(100%)"
      case "right-to-left":
        return "translateX(-100%)"
      case "top-to-bottom":
        return "translateY(100%)"
      case "bottom-to-top":
        return "translateY(-100%)"
      default:
        return "translateX(100%)"
    }
  }

  const getBlindCoveringTransform = (dir: string) => {
    switch (dir) {
      case "left-to-right":
      case "right-to-left":
        return "translateX(0)"
      case "top-to-bottom":
      case "bottom-to-top":
        return "translateY(0)"
      default:
        return "translateX(0)"
    }
  }

  const getBlindInPhaseTransform = (progress: number, dir: string) => {
    if (progress <= 0) return getBlindInStartTransform(dir)
    if (progress >= 1) return getBlindCoveringTransform(dir)
    switch (dir) {
      case "left-to-right":
        return `translateX(${100 * (1 - progress)}%)`
      case "right-to-left":
        return `translateX(${-100 * (1 - progress)}%)`
      case "top-to-bottom":
        return `translateY(${100 * (1 - progress)}%)`
      case "bottom-to-top":
        return `translateY(${-100 * (1 - progress)}%)`
      default:
        return `translateX(${100 * (1 - progress)}%)`
    }
  }

  const getOppositeDirection = (dir: string) => {
    switch (dir) {
      case "left-to-right":
        return "right-to-left"
      case "right-to-left":
        return "left-to-right"
      case "top-to-bottom":
        return "bottom-to-top"
      case "bottom-to-top":
        return "top-to-bottom"
      default:
        return dir
    }
  }

  const getDirectionForIndex = (index: number) => {
    if (!alternate) return direction
    return index % 2 === 0 ? direction : getOppositeDirection(direction)
  }

  const getStaggerDelayForIndex = (index: number, total: number) => {
    switch (lineOrder) {
      case "first-to-last":
        return index * staggerAmount
      case "last-to-first":
        return (total - 1 - index) * staggerAmount
      case "center-out": {
        const center = (total - 1) / 2
        const distanceFromCenter = Math.abs(index - center)
        return distanceFromCenter * staggerAmount
      }
      case "out-to-center": {
        const center = (total - 1) / 2
        const maxDistance = center
        const distanceFromCenter = Math.abs(index - center)
        return (maxDistance - distanceFromCenter) * staggerAmount
      }
      default:
        return index * staggerAmount
    }
  }

  const buildTransitionConfig = (transitionValue: any) => {
    const config: Record<string, any> = {}
    if (transitionValue?.type === "spring") {
      config.type = "spring"
      if (transitionValue.stiffness !== undefined) config.stiffness = transitionValue.stiffness
      if (transitionValue.damping !== undefined) config.damping = transitionValue.damping
      if (transitionValue.mass !== undefined) config.mass = transitionValue.mass
      if (transitionValue.bounce !== undefined) config.bounce = transitionValue.bounce
      if (transitionValue.restDelta !== undefined) config.restDelta = transitionValue.restDelta
      if (transitionValue.restSpeed !== undefined) config.restSpeed = transitionValue.restSpeed
    } else {
      config.type = transitionValue?.type || "tween"
      if (transitionValue?.duration !== undefined) config.duration = transitionValue.duration
      if (transitionValue?.ease) config.ease = transitionValue.ease
    }
    return config
  }

  const setupSplit = (shouldRevert = false) => {
    if (!textRef.current) return null
    if (shouldRevert && lineSplitRef.current) {
      lineSplitRef.current.revert()
      lineSplitRef.current = null
      blindElementsRef.current = []
      lineElementsRef.current = []
    }
    const lineSplit = SplitText.create(textRef.current, { type: "lines" })
    const lines = lineSplit.lines
    lineSplitRef.current = lineSplit
    const blinds: HTMLElement[] = []
    const lineElements: HTMLElement[] = []
    lines.forEach((line: HTMLElement) => {
      const wrapper = document.createElement("div")
      wrapper.style.display = "inline-block"
      wrapper.style.verticalAlign = "top"
      wrapper.style.position = "relative"
      wrapper.style.overflow = "hidden"
      wrapper.style.width = "fit-content"
      line.parentNode?.insertBefore(wrapper, line)
      wrapper.appendChild(line)
      const blind = document.createElement("div")
      blind.style.position = "absolute"
      blind.style.top = "0"
      blind.style.left = "0"
      blind.style.width = "100%"
      blind.style.height = "100%"
      blind.style.background = blindsColor
      blind.style.transformOrigin = getTransformOrigin(direction)
      wrapper.appendChild(blind)
      blinds.push(blind)
      lineElements.push(line)
      if (animationMode === "in-out") {
        line.style.opacity = "0"
      }
    })
    blindElementsRef.current = blinds
    lineElementsRef.current = lineElements
    return { lineSplit, blinds, lines: lineElements }
  }

  const setBlindsInitial = (blinds: HTMLElement[]) => {
    blinds.forEach((blind, index) => {
      const dir = getDirectionForIndex(index)
      blind.style.transform = getInitialTransform(dir)
    })
  }

  const setBlindsRevealed = (blinds: HTMLElement[]) => {
    blinds.forEach((blind, index) => {
      const dir = getDirectionForIndex(index)
      blind.style.transform = getRevealedTransform(dir)
    })
  }

  const animateBlinds = (blinds: HTMLElement[], forward: boolean) => {
    animationControlsRef.current.forEach((control) => control.stop())
    animationControlsRef.current = []
    const transitionConfig = buildTransitionConfig(transition)
    const baseDelay = transition?.delay ?? 0
    const total = blinds.length
    blinds.forEach((blind, index) => {
      const elementDelay = baseDelay + getStaggerDelayForIndex(index, total)
      const dir = getDirectionForIndex(index)
      if (forward) {
        blind.style.transform = getInitialTransform(dir)
        const control = animate(0, 1, {
          ...transitionConfig,
          delay: elementDelay,
          onUpdate: (progress) => {
            blind.style.transform = getBlindTransform(progress, dir)
          },
        })
        animationControlsRef.current.push(control)
      } else {
        const control = animate(1, 0, {
          ...transitionConfig,
          delay: elementDelay,
          onUpdate: (progress) => {
            blind.style.transform = getBlindTransform(progress, dir)
          },
        })
        animationControlsRef.current.push(control)
      }
    })
  }

  const animateBlindsInOut = (blinds: HTMLElement[], lines: HTMLElement[], forward: boolean) => {
    animationControlsRef.current.forEach((control) => control.stop())
    animationControlsRef.current = []
    const transitionInConfig = buildTransitionConfig(transitionIn ?? { type: "tween", duration: 0.5, ease: "easeIn" })
    const transitionOutConfig = buildTransitionConfig(transition)
    const baseDelayIn = transitionIn?.delay ?? 0
    const baseDelayOut = transition?.delay ?? 0
    const total = blinds.length
    if (!forward) {
      blinds.forEach((blind, index) => {
        const dir = getDirectionForIndex(index)
        blind.style.transform = getBlindInStartTransform(dir)
      })
      lines.forEach((line) => {
        line.style.opacity = "0"
      })
      hasAnimatedRef.current = false
      return
    }
    blinds.forEach((blind, index) => {
      const dir = getDirectionForIndex(index)
      blind.style.transform = getBlindInStartTransform(dir)
      const elementDelayIn = baseDelayIn + getStaggerDelayForIndex(index, total)
      const controlIn = animate(0, 1, {
        ...transitionInConfig,
        delay: elementDelayIn,
        onUpdate: (progress) => {
          blind.style.transform = getBlindInPhaseTransform(progress, dir)
        },
        onComplete: () => {
          lines[index]!.style.opacity = "1"
          blind.style.transform = getBlindCoveringTransform(dir)
          const elementDelayOut = baseDelayOut + getStaggerDelayForIndex(index, total)
          const controlOut = animate(0, 1, {
            ...transitionOutConfig,
            delay: elementDelayOut,
            onUpdate: (progress) => {
              blind.style.transform = getBlindTransform(progress, dir)
            },
          })
          animationControlsRef.current.push(controlOut)
        },
      })
      animationControlsRef.current.push(controlIn)
    })
  }

  const areBlindsInInitialState = (blinds: HTMLElement[]) => {
    if (blinds.length === 0) return false
    const first = blinds[0]!
    const t = first.style.transform || ""
    if (animationMode === "in-out") {
      const inStart = getBlindInStartTransform(direction)
      return t.includes(inStart) || t === ""
    }
    const initial = getInitialTransform(direction)
    return t.includes("(0)") || t === "" || t === initial
  }

  const setBlindsInOutInitial = (blinds: HTMLElement[], lines: HTMLElement[]) => {
    blinds.forEach((blind, index) => {
      const dir = getDirectionForIndex(index)
      blind.style.transform = getBlindInStartTransform(dir)
    })
    lines.forEach((line) => {
      line.style.opacity = "0"
    })
  }

  useEffect(() => {
    if (trigger !== "Appear") return
    if (hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    const result = setupSplit()
    if (!result) return
    if (animationMode === "in-out") {
      animateBlindsInOut(result.blinds, result.lines, true)
    } else {
      animateBlinds(result.blinds, true)
    }
    return () => {
      animationControlsRef.current.forEach((control) => control.stop())
      if (lineSplitRef.current) {
        lineSplitRef.current.revert()
        lineSplitRef.current = null
      }
      blindElementsRef.current = []
      lineElementsRef.current = []
    }
  }, [])

  useEffect(() => {
    if (trigger !== "Scroll") return
    if (!textRef.current) return
    const result = setupSplit()
    if (!result) return
    if (animationMode === "in-out") {
      setBlindsInOutInitial(result.blinds, result.lines)
    } else {
      setBlindsInitial(result.blinds)
    }
    return () => {
      animationControlsRef.current.forEach((control) => control.stop())
      if (lineSplitRef.current) {
        lineSplitRef.current.revert()
        lineSplitRef.current = null
      }
      blindElementsRef.current = []
      lineElementsRef.current = []
    }
  }, [trigger, text, blindsColor, direction, animationMode])

  useEffect(() => {
    if (trigger !== "Scroll") return
    let rafId: number | null = null
    const checkAlignment = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 0
      let elementPoint: number
      if (scrollTriggerPosition === "top") {
        elementPoint = rect.top
      } else if (scrollTriggerPosition === "center") {
        elementPoint = rect.top + rect.height / 2
      } else {
        elementPoint = rect.bottom
      }
      const isAligned = elementPoint <= viewportHeight && rect.bottom >= 0
      setIsInView(isAligned)
      const completelyOutOfView = rect.top > viewportHeight
      setIsOutOfView(completelyOutOfView)
    }
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(checkAlignment)
    }
    const handleResize = () => checkAlignment()
    checkAlignment()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [trigger, scrollTriggerPosition])

  useEffect(() => {
    if (trigger !== "Scroll") return
    const blinds = blindElementsRef.current
    if (!blinds.length) return
    if (isOutOfView) {
      if (reverse) {
        animationControlsRef.current.forEach((control) => control.stop())
        animationControlsRef.current = []
        if (animationMode === "in-out") {
          const lines = lineElementsRef.current
          if (lines.length) setBlindsInOutInitial(blinds, lines)
        } else {
          setBlindsInitial(blinds)
        }
        hasAnimatedRef.current = false
      }
      return
    }
    if (isInView && areBlindsInInitialState(blinds)) {
      hasAnimatedRef.current = true
      if (animationMode === "in-out") {
        const lines = lineElementsRef.current
        animateBlindsInOut(blinds, lines, true)
      } else {
        animateBlinds(blinds, true)
      }
    }
  }, [isInView, isOutOfView, reverse, trigger, animationMode])

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      if (isFirstResizeRef.current) {
        isFirstResizeRef.current = false
        return
      }
      if (!hasAnimatedRef.current) return
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
      resizeTimeoutRef.current = setTimeout(() => {
        if (!hasAnimatedRef.current) return
        if (trigger !== "Scroll") return
        const result = setupSplit(true)
        if (result) {
          setBlindsRevealed(result.blinds)
          if (animationMode === "in-out") {
            result.lines.forEach((line) => {
              line.style.opacity = "1"
            })
          }
        }
      }, 50)
    })
    resizeObserver.observe(containerRef.current)
    return () => {
      resizeObserver.disconnect()
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current)
    }
  }, [trigger])

  return (
    <div
      ref={containerRef}
      className={`blinds-text-reveal ${className}`}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "auto",
        backgroundColor: "transparent",
        ...style,
      }}
    >
      <TAG
        ref={textRef}
        className={className}
        style={{
          margin: 0,
          color,
          ...font,
          fontSize: font.fontSize,
          fontWeight: font.fontWeight,
          fontFamily: font.fontFamily,
          fontStyle: font.fontStyle,
          textDecoration: font.textDecoration,
          letterSpacing: font.letterSpacing,
          lineHeight: font.lineHeight,
          textAlign: font.textAlign,
          marginBlock: 0,
          marginInline: 0,
          padding: 0,
          width: "100%",
        }}
      >
        {text}
      </TAG>
    </div>
  )
}
