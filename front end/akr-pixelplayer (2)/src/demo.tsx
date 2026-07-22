import React from "react"
import { createRoot } from "react-dom/client"
import BlindsTextReveal from "./BlindsTextReveal"

const font = {
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  fontWeight: 700,
  fontSize: 40,
  textAlign: "center" as const,
  lineHeight: "150%",
  letterSpacing: "-0.035em",
}

const transition = { type: "tween" as const, duration: 0.6, ease: [0.28, 0.25, 0.18, 0.98] }
const transitionIn = { type: "tween" as const, duration: 0.45, ease: [0.81, -0.02, 0.55, 0.51] }
const scrollProps = { trigger: "Scroll" as const, scrollTriggerPosition: "center" as const, reverse: true }

function Section({
  text,
  color,
  blindsColor,
  direction,
  font: sectionFont,
  ...rest
}: {
  text: string
  color: string
  blindsColor: string
  direction: string
  font: Record<string, any>
  [key: string]: any
}) {
  return (
    <div style={{ padding: "100px 0", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <BlindsTextReveal
        text={text}
        color={color}
        blindsColor={blindsColor}
        direction={direction}
        font={sectionFont}
        transition={transition}
        transitionIn={transitionIn}
        staggerAmount={0.06}
        {...scrollProps}
        {...rest}
      />
    </div>
  )
}

const root = createRoot(document.getElementById("root")!)
root.render(
  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
    <Section
      text="Scroll to reveal each paragraph. Every line is covered and then slides away with a smooth motion — customize direction, colors, and timing for unique effects."
      color="#1a1a2e"
      blindsColor="#8B5CF6"
      direction="left-to-right"
      font={font}
    />

    <Section
      text="The animation can go left to right, right to left, top to bottom, or bottom to top. The in-out mode first slides blinds in to cover the text, then slides them out to reveal it."
      color="#1a1a2e"
      blindsColor="#EC4899"
      direction="right-to-left"
      animationMode="in-out"
      font={{ ...font, fontWeight: 600, fontSize: 36 }}
    />

    <Section
      text="With the alternate option each line animates in the opposite direction of the one before it. This creates a striking wave-like zigzag pattern across your content."
      color="#1a1a2e"
      blindsColor="#F59E0B"
      direction="left-to-right"
      alternate={true}
      font={{ ...font, fontWeight: 800, fontSize: 38 }}
    />

    <Section
      text="Choose from four line order options — first to last, last to first, center out, or out to center. Combine with different directions for endless possibilities."
      color="#1a1a2e"
      blindsColor="#10B981"
      direction="top-to-bottom"
      lineOrder="center-out"
      staggerAmount={0.05}
      font={{ ...font, fontWeight: 600, fontSize: 34 }}
    />

    <Section
      text="Spring transitions give a bouncy organic feel while tweens stay smooth and controlled. Adjust stiffness, damping, and duration to fine tune every animation."
      color="#1a1a2e"
      blindsColor="#3B82F6"
      direction="left-to-right"
      animationMode="in-out"
      staggerAmount={0.08}
      font={{ ...font, fontWeight: 700, fontSize: 36 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, duration: 0.6 }}
    />
  </div>
)
