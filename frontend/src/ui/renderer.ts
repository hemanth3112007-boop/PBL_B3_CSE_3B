/**
 * DeltaSpec UI Rendering & SVG Calculation Engine
 * Handles coordinate math, polygon point generation, and color mapping for high-density telemetry
 */

export interface Point {
  x: number;
  y: number;
  angle: number;
}

export function computeRadarSpokeCoordinates(
  index: number,
  totalAxes: number,
  value: number,
  center: number,
  maxRadius: number
): Point {
  const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
  const radius = (Math.min(100, Math.max(0, value)) / 100) * maxRadius;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
    angle,
  };
}

export function generatePolygonPoints(
  values: number[],
  center: number,
  maxRadius: number
): string {
  return values
    .map((val, idx) => {
      const { x, y } = computeRadarSpokeCoordinates(idx, values.length, val, center, maxRadius);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function getReadinessColor(score: number): string {
  if (score >= 85) return '#38BDF8'; // Verified Match / Sky Blue
  if (score >= 70) return '#0EA5E9'; // Active Telemetry / Blue
  if (score >= 55) return '#60A5FA'; // Partial Gap / Soft Blue
  return '#F43F5E';                  // Critical Deficit / Coral
}

export function formatPercentile(percentile: number): string {
  return `Top ${(100 - percentile).toFixed(1)}%`;
}
