export interface BoardCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  squareSize: number;
}

export interface PlatformAdapter {
  name: string;
  detectBoard(): Promise<BoardCoordinates | null>;
  getFEN(): Promise<string | null>;
  getPlayerColor(): Promise<'white' | 'black' | null>;
  isMyTurn(): Promise<boolean>;
  executeMove(from: string, to: string, promotion?: string): Promise<boolean>;
}

export abstract class BaseAdapter implements PlatformAdapter {
  abstract name: string;

  abstract detectBoard(): Promise<BoardCoordinates | null>;
  abstract getFEN(): Promise<string | null>;
  abstract getPlayerColor(): Promise<'white' | 'black' | null>;
  abstract isMyTurn(): Promise<boolean>;
  abstract executeMove(from: string, to: string, promotion?: string): Promise<boolean>;

  protected squareToCoordinates(
    square: string,
    boardCoords: BoardCoordinates,
    flipped: boolean
  ): { x: number; y: number } {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = parseInt(square[1]) - 1; // 1=0, 2=1, etc.

    let x, y;
    
    if (flipped) {
      x = boardCoords.x + (7 - file) * boardCoords.squareSize + boardCoords.squareSize / 2;
      y = boardCoords.y + rank * boardCoords.squareSize + boardCoords.squareSize / 2;
    } else {
      x = boardCoords.x + file * boardCoords.squareSize + boardCoords.squareSize / 2;
      y = boardCoords.y + (7 - rank) * boardCoords.squareSize + boardCoords.squareSize / 2;
    }

    return { x: Math.round(x), y: Math.round(y) };
  }

  protected coordinatesToSquare(
    x: number,
    y: number,
    boardCoords: BoardCoordinates,
    flipped: boolean
  ): string {
    const relX = x - boardCoords.x;
    const relY = y - boardCoords.y;
    
    let file = Math.floor(relX / boardCoords.squareSize);
    let rank = Math.floor(relY / boardCoords.squareSize);

    if (flipped) {
      file = 7 - file;
    } else {
      rank = 7 - rank;
    }

    if (file < 0 || file > 7 || rank < 0 || rank > 7) {
      return '';
    }

    return String.fromCharCode(97 + file) + (rank + 1);
  }
}
