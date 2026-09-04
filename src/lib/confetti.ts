import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#0a66c2', '#004182', '#38bdf8', '#fbbf24', '#34d399'],
  });
}
