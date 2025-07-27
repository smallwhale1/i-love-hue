import chroma from "chroma-js";
import { GRID_WIDTH } from "./constants";

export const idxToRowCol = (
  idx: number
): {
  row: number;
  col: number;
} => {
  const row = Math.floor(idx / GRID_WIDTH);
  const col = idx % GRID_WIDTH;

  return {
    row,
    col,
  };
};

export const rowColToIdx = (row: number, col: number): number => {
  return row * GRID_WIDTH + col;
};

export const genGridColors = (
  width: number,
  height: number,
  topLeft: string,
  topRight: string,
  bottomLeft: string,
  bottomRight: string
): string[][] => {
  // interpolation algorithm
  // gen left side
  const tlToBl = colorInterpolate(height, topLeft, bottomLeft);
  const tRToBr = colorInterpolate(height, topRight, bottomRight);
  return Array.from({ length: height }, (_, index) =>
    colorInterpolate(width, tlToBl[index], tRToBr[index])
  );
};

export const colorInterpolate = (
  numColors: number,
  start: string,
  end: string
): string[] => {
  // console.log(chroma);
  let colors = [];
  for (let i = 0; i < numColors; i++) {
    let color = chroma.mix(start, end, i / (numColors - 1)).hex();
    // console.log(color);
    colors.push(color);
  }
  return colors as string[];
  // console.log(chroma.mix(start, end, 0).hex());
};

colorInterpolate(5, "#ee7d6e", "#387ed9");
