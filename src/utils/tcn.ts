/**
 * TCN (Ternary Chess Notation) decoder for Chess.com
 * Chess.com uses a proprietary format to encode moves
 */

const FILES = 'abcdefgh';
const PIECES = 'qrbnkp';

export interface DecodedMove {
  from: string;
  to: string;
  promotion?: string;
  capture?: boolean;
}

/**
 * Decode Chess.com TCN format
 * Format: Each move is encoded in 2 characters
 */
export function decodeTCN(tcn: string): DecodedMove[] {
  const moves: DecodedMove[] = [];
  
  // TCN is typically a continuous string of encoded moves
  for (let i = 0; i < tcn.length; i += 2) {
    if (i + 1 >= tcn.length) break;
    
    const byte1 = tcn.charCodeAt(i);
    const byte2 = tcn.charCodeAt(i + 1);
    
    // Decode from square (6 bits)
    const fromFile = byte1 & 0x07;
    const fromRank = (byte1 >> 3) & 0x07;
    
    // Decode to square (6 bits)
    const toFile = byte2 & 0x07;
    const toRank = (byte2 >> 3) & 0x07;
    
    // Check for special flags (promotion, capture, etc.)
    const promotion = (byte2 >> 6) & 0x03;
    
    const from = FILES[fromFile] + (fromRank + 1);
    const to = FILES[toFile] + (toRank + 1);
    
    let promotionPiece: string | undefined;
    if (promotion > 0) {
      promotionPiece = PIECES[promotion - 1];
    }
    
    moves.push({
      from,
      to,
      promotion: promotionPiece,
    });
  }
  
  return moves;
}

/**
 * Encode move to TCN format (reverse operation)
 */
export function encodeTCN(moves: DecodedMove[]): string {
  let tcn = '';
  
  for (const move of moves) {
    const fromFile = FILES.indexOf(move.from[0]);
    const fromRank = parseInt(move.from[1]) - 1;
    const toFile = FILES.indexOf(move.to[0]);
    const toRank = parseInt(move.to[1]) - 1;
    
    let byte1 = fromFile | (fromRank << 3);
    let byte2 = toFile | (toRank << 3);
    
    if (move.promotion) {
      const promoIndex = PIECES.indexOf(move.promotion.toLowerCase());
      if (promoIndex >= 0) {
        byte2 |= ((promoIndex + 1) << 6);
      }
    }
    
    tcn += String.fromCharCode(byte1) + String.fromCharCode(byte2);
  }
  
  return tcn;
}

/**
 * Parse Chess.com game data
 */
export function parseChessComGameData(data: any): {
  fen: string;
  moves: string[];
  playerColor: 'white' | 'black';
} | null {
  try {
    // Chess.com stores game data in various formats
    // This is a simplified parser
    const fen = data.fen || data.startingFEN;
    const tcn = data.tcn || data.moves;
    
    let moves: string[] = [];
    if (typeof tcn === 'string') {
      const decoded = decodeTCN(tcn);
      moves = decoded.map(m => `${m.from}${m.to}${m.promotion || ''}`);
    }
    
    const playerColor = data.playerColor || 'white';
    
    return { fen, moves, playerColor };
  } catch (error) {
    console.error('Error parsing Chess.com game data:', error);
    return null;
  }
}
