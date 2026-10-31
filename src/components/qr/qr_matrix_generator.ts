/**
 * @file qr_matrix_generator.ts
 * @description 25x25 QR matrix generation with finders, timing, and deterministic data.
 */

export const MATRIX_SIZE = 25;

export function generateQRMatrix(seed = 21): boolean[][] {
  const grid: boolean[][] = Array.from({ length: MATRIX_SIZE }, () => Array(MATRIX_SIZE).fill(false));
  const reserved: boolean[][] = Array.from({ length: MATRIX_SIZE }, () => Array(MATRIX_SIZE).fill(false));

  const applyFinder = (ox: number, oy: number) => {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const x = ox + dx, y = oy + dy;
        if (x >= 0 && x < MATRIX_SIZE && y >= 0 && y < MATRIX_SIZE) {
          reserved[y][x] = true; grid[y][x] = false;
        }
      }
    }
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const x = ox + dx, y = oy + dy;
        reserved[y][x] = true;
        grid[y][x] = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      }
    }
  };

  applyFinder(0, 0); applyFinder(18, 0); applyFinder(0, 18);
  for (let i = 8; i < 17; i++) {
    reserved[6][i] = true; grid[6][i] = i % 2 === 0;
    reserved[i][6] = true; grid[i][6] = i % 2 === 0;
  }
  for (let y = 10; y <= 14; y++) {
    for (let x = 10; x <= 14; x++) { reserved[y][x] = true; grid[y][x] = false; }
  }

  let currentSeed = typeof seed === 'number' && seed !== 0 ? Math.abs(seed) : 21;
  for (let y = 0; y < MATRIX_SIZE; y++) {
    for (let x = 0; x < MATRIX_SIZE; x++) {
      if (!reserved[y][x]) {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        grid[y][x] = currentSeed / 233280 > 0.46;
      }
    }
  }
  return grid;
}
