/**
 * Coordinate conversion utilities for chess board
 */

export interface Point {
  x: number;
  y: number;
}

export interface BoardBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert chess square notation to board coordinates
 */
export function squareToCoords(
  square: string,
  boardBounds: BoardBounds,
  isFlipped = false
): Point {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
  const rank = parseInt(square[1]) - 1;   // 1=0, 2=1, ..., 8=7
  
  const squareSize = boardBounds.width / 8;
  
  let x: number, y: number;
  
  if (isFlipped) {
    // Board is flipped (black on bottom)
    x = boardBounds.x + (7 - file) * squareSize + squareSize / 2;
    y = boardBounds.y + rank * squareSize + squareSize / 2;
  } else {
    // Normal orientation (white on bottom)
    x = boardBounds.x + file * squareSize + squareSize / 2;
    y = boardBounds.y + (7 - rank) * squareSize + squareSize / 2;
  }
  
  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * Convert screen coordinates to chess square notation
 */
export function coordsToSquare(
  point: Point,
  boardBounds: BoardBounds,
  isFlipped = false
): string | null {
  const relX = point.x - boardBounds.x;
  const relY = point.y - boardBounds.y;
  
  if (relX < 0 || relX >= boardBounds.width || relY < 0 || relY >= boardBounds.height) {
    return null;
  }
  
  const squareSize = boardBounds.width / 8;
  
  let file = Math.floor(relX / squareSize);
  let rank = Math.floor(relY / squareSize);
  
  if (isFlipped) {
    file = 7 - file;
  } else {
    rank = 7 - rank;
  }
  
  if (file < 0 || file > 7 || rank < 0 || rank > 7) {
    return null;
  }
  
  return String.fromCharCode(97 + file) + (rank + 1).toString();
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Parse move notation (e.g., "e2e4" to {from: "e2", to: "e4"})
 */
export function parseMove(move: string): { from: string; to: string; promotion?: string } | null {
  if (move.length < 4) {
    return null;
  }
  
  const from = move.substring(0, 2);
  const to = move.substring(2, 4);
  const promotion = move.length > 4 ? move[4] : undefined;
  
  return { from, to, promotion };
}

/**
 * Format move notation from components
 */
export function formatMove(from: string, to: string, promotion?: string): string {
  return `${from}${to}${promotion || ''}`;
}
