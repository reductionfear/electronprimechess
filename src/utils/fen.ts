/**
 * FEN (Forsyth–Edwards Notation) utilities
 */

export function validateFen(fen: string): boolean {
  const parts = fen.trim().split(/\s+/);
  
  // FEN should have 6 parts
  if (parts.length !== 6) {
    return false;
  }
  
  const [position, activeColor, castling, enPassant, halfmove, fullmove] = parts;
  
  // Validate position
  const ranks = position.split('/');
  if (ranks.length !== 8) {
    return false;
  }
  
  // Validate each rank
  for (const rank of ranks) {
    let squareCount = 0;
    for (const char of rank) {
      if (/[1-8]/.test(char)) {
        squareCount += parseInt(char);
      } else if (/[pnbrqkPNBRQK]/.test(char)) {
        squareCount += 1;
      } else {
        return false;
      }
    }
    if (squareCount !== 8) {
      return false;
    }
  }
  
  // Validate active color
  if (!/^[wb]$/.test(activeColor)) {
    return false;
  }
  
  // Validate castling
  if (!/^(-|[KQkq]{1,4})$/.test(castling)) {
    return false;
  }
  
  // Validate en passant
  if (!/^(-|[a-h][36])$/.test(enPassant)) {
    return false;
  }
  
  // Validate halfmove and fullmove
  if (!/^\d+$/.test(halfmove) || !/^\d+$/.test(fullmove)) {
    return false;
  }
  
  return true;
}

export function parseFen(fen: string) {
  const parts = fen.trim().split(/\s+/);
  
  return {
    position: parts[0] || '',
    activeColor: parts[1] || 'w',
    castling: parts[2] || 'KQkq',
    enPassant: parts[3] || '-',
    halfmove: parseInt(parts[4] || '0'),
    fullmove: parseInt(parts[5] || '1'),
  };
}

export function buildFen(
  position: string,
  activeColor: 'w' | 'b',
  castling: string,
  enPassant: string,
  halfmove: number,
  fullmove: number
): string {
  return `${position} ${activeColor} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
}

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
