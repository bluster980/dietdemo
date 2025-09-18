import React, { useRef, useEffect } from "react";

const DEFAULT_SIZE = 400;
const DEFAULT_PROGRESS = 0.8;
const DEFAULT_BUBBLE_COUNT = 55;


const WAVE1_AMPLITUDE = 18;
const WAVE2_AMPLITUDE = 12;
const WAVE1_FREQUENCY_MULTIPLIER = 1.2;
const WAVE2_FREQUENCY_MULTIPLIER = 0.98;
const WAVE1_SPEED = 1.2;
const WAVE2_SPEED = -0.88;
const WAVE2_OFFSET = 14;

const WAVE1_TOP_COLOR = "#0f4a84";
const WAVE1_BOTTOM_COLOR = "#208FFB";
const WAVE2_TOP_COLOR = "#2b7bbf";
const WAVE2_BOTTOM_COLOR = "#208FFB";

const BUBBLE_COLOR = "#93c7fa";

class Bubble {
  constructor(x, y, r, velY, lifespan, opacity) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.velY = velY;
    this.lifespan = lifespan;
    this.opacity = opacity;
    this.age = 0;
    this.currentRadius = 0;
    this.currentOpacity = opacity;
  }
  update(deltaTime) {
    this.y -= this.velY * deltaTime;
    this.age += deltaTime;
    if (this.currentRadius < this.r) {
      this.currentRadius += 18 * deltaTime;
      if (this.currentRadius > this.r) this.currentRadius = this.r;
    }
    const fadeTime = this.lifespan * 0.2;
    if (this.age > this.lifespan - fadeTime) {
      this.currentOpacity = Math.max(
        0,
        this.opacity * (1 - (this.age - (this.lifespan - fadeTime)) / fadeTime)
      );
    }
  }
  isDead() {
    return this.age >= this.lifespan;
  }
}

export default function CustomFluidMeter({
  size = DEFAULT_SIZE,
  targetProgress = DEFAULT_PROGRESS,
  bubbleCount = DEFAULT_BUBBLE_COUNT,
  bgColor = "rgba(2,37,73,0.32)",
}) {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  // Utility random function
  const random = (min, max) => Math.random() * (max - min) + min;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set size and scale for crisp visuals on HiDPI screens
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const minX = 12;
    const maxX = size - 12;
    const minY = size + 12;
    const maxY = size + 50;
    const averageSpeed = 75;
    const speedDeviation = 9;
    const averageSize = 3;
    const yThreshold = size * (1 - targetProgress);

    // Create a new bubble instance
    const createBubble = () => {
      const x = random(minX, maxX);
      const y = random(minY, maxY);
      const r = random(averageSize * 0.5, averageSize * 1.6);
      const opacity = r < averageSize ? 0.46 : 0.88;
      const velY = random(averageSpeed - speedDeviation, averageSpeed + speedDeviation);
      const totalDistance = y - yThreshold;
      const lifespan = totalDistance / velY;
      return new Bubble(x, y, r, velY, lifespan, opacity);
    };

    // Initialize bubbles array empty for continuous spawning
    bubbles.current = [];

    let lastTimestamp = 0;
    let progress = 0;
    let animFrameId = null;
    let wave1Phase = 0;
    let wave2Phase = 0;
    let bubbleSpawnTimer = 0;

    // Frequency based on size
    const wave1Frequency = size * WAVE1_FREQUENCY_MULTIPLIER;
    const wave2Frequency = size * WAVE2_FREQUENCY_MULTIPLIER;

    // Animate progress fill speed
    const fillSpeed = 0.32;

    const draw = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Manage bubble spawning continuously
      bubbleSpawnTimer += deltaTime;
      bubbles.current = bubbles.current.filter((b) => !b.isDead());
      if (bubbles.current.length < bubbleCount && bubbleSpawnTimer > 0.03) {
        bubbles.current.push(createBubble());
        bubbleSpawnTimer = 0;
      }

      ctx.clearRect(0, 0, size, size);

      // Animate progress increase up to target
      if (progress < targetProgress) {
        progress += fillSpeed * deltaTime;
        if (progress > targetProgress) progress = targetProgress;
      }

      wave1Phase += WAVE1_SPEED * deltaTime;
      wave2Phase += WAVE2_SPEED * deltaTime;

      const fillLevel = size * (1 - progress);

      // Draw second wave (bottom layer)
      ctx.beginPath();
      ctx.moveTo(0, size);
      for (let x = 0; x <= size; x++) {
        const y =
          fillLevel +
          WAVE2_OFFSET +
          WAVE2_AMPLITUDE *
            Math.sin((x / wave2Frequency) * 2 * Math.PI + wave2Phase);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.closePath();
      const grad2 = ctx.createLinearGradient(
        0,
        fillLevel + WAVE2_OFFSET - WAVE2_AMPLITUDE * 0.8,
        0,
        size
      );
      grad2.addColorStop(0, WAVE2_TOP_COLOR);
      grad2.addColorStop(0.57, WAVE2_TOP_COLOR);
      grad2.addColorStop(1, WAVE2_BOTTOM_COLOR);
      ctx.fillStyle = grad2;
      ctx.globalAlpha = 0.94;
      ctx.fill();

      ctx.globalAlpha = 1;

      // Draw first wave (top layer)
      ctx.beginPath();
      ctx.moveTo(0, size);
      for (let x = 0; x <= size; x++) {
        const y =
          fillLevel + WAVE1_AMPLITUDE * Math.sin((x / wave1Frequency) * 2 * Math.PI + wave1Phase);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.closePath();

      // Gradient reversed bottom to top
      const grad1 = ctx.createLinearGradient(0, size, 0, fillLevel - WAVE1_AMPLITUDE * 0.9);
      grad1.addColorStop(0, WAVE1_BOTTOM_COLOR);
      grad1.addColorStop(0.55, WAVE1_TOP_COLOR);
      grad1.addColorStop(1, WAVE1_TOP_COLOR);
      ctx.fillStyle = grad1;
      ctx.fill();

      // Bubbles layering
      const topLayerCount = Math.round(bubbleCount * 0.4);

      bubbles.current.forEach((bubble, i) => {
        bubble.update(deltaTime);

        // Cap bubbles array length
        if (bubbles.current.length > bubbleCount) {
          bubbles.current.length = bubbleCount;
        }

        const isTopLayer = i < topLayerCount;
        const opacity = isTopLayer ? bubble.currentOpacity : bubble.currentOpacity;

        if (bubble.y < size && bubble.y > fillLevel) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.currentRadius, 0, 2 * Math.PI);

          // Adjust glow and stroke for visual clarity
          ctx.shadowColor = BUBBLE_COLOR;
          ctx.shadowBlur = isTopLayer ? 2 : 1;
          ctx.strokeStyle = `rgba(69,142,214,${opacity})`;
          ctx.lineWidth = isTopLayer ? 1.4 : 1;
          ctx.globalAlpha = opacity;

          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      });

      // Progress text styling
      ctx.font = "bold 40px 'codystar', Arial, sans-serif";
      ctx.fillStyle = "#ebebeb";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 6;
      ctx.fillText(`${Math.round(progress * 100)}%`, size / 2, size / 2);

      animFrameId = requestAnimationFrame(draw);
    };

    animFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [size, targetProgress, bubbleCount]);

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
