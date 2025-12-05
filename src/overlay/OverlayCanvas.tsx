import React, { useEffect, useRef } from 'react';
import { useStore } from '../renderer/store/useStore';
import { squareToCoords } from '../utils/coordinates';

interface Arrow {
  from: string;
  to: string;
  color: string;
  opacity: number;
}

export const OverlayCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, overlayState } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!overlayState.visible || !overlayState.showArrows) return;

    // Draw arrows for best moves
    const arrows: Arrow[] = [];

    // Best move (green)
    if (gameState.bestMove && gameState.bestMove.length >= 4) {
      arrows.push({
        from: gameState.bestMove.substring(0, 2),
        to: gameState.bestMove.substring(2, 4),
        color: '#22c55e', // green-500
        opacity: overlayState.arrowOpacity,
      });
    }

    // Second best move (orange)
    if (gameState.lines.length > 1 && gameState.lines[1].moves.length > 0) {
      const move = gameState.lines[1].moves[0];
      if (move && move.length >= 4) {
        arrows.push({
          from: move.substring(0, 2),
          to: move.substring(2, 4),
          color: '#f97316', // orange-500
          opacity: overlayState.arrowOpacity * 0.7,
        });
      }
    }

    // Placeholder board bounds - would come from browser detection
    const boardBounds = {
      x: 0,
      y: 0,
      width: 800,
      height: 800,
    };

    // Draw each arrow
    arrows.forEach((arrow) => {
      drawArrow(ctx, arrow, boardBounds);
    });
  }, [gameState, overlayState]);

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    arrow: Arrow,
    boardBounds: { x: number; y: number; width: number; height: number }
  ) => {
    const from = squareToCoords(arrow.from, boardBounds, false);
    const to = squareToCoords(arrow.to, boardBounds, false);

    ctx.strokeStyle = arrow.color;
    ctx.fillStyle = arrow.color;
    ctx.globalAlpha = arrow.opacity;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    // Draw line
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 20;
    const arrowWidth = 15;

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - arrowLength * Math.cos(angle - Math.PI / 6),
      to.y - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - arrowLength * Math.cos(angle + Math.PI / 6),
      to.y - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      className="absolute inset-0 pointer-events-none"
    />
  );
};
