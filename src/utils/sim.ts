import { Vector2 } from '../types/simulation';

export const distance = (a: Vector2, b: Vector2) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const moveTowards = (current: Vector2, target: Vector2, maxDelta: number) => {
  const dist = distance(current, target);
  if (dist <= maxDelta || dist === 0) {
    return { ...target };
  }
  const ratio = maxDelta / dist;
  return {
    x: current.x + (target.x - current.x) * ratio,
    y: current.y + (target.y - current.y) * ratio,
  };
};

export const formatTime = (timeMs: number) => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

export const randomPlate = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  return `${pick(letters)}${pick(letters)}-${pick(digits)}${pick(digits)}${pick(digits)}${pick(digits)}`;
};
