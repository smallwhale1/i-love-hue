import { useEffect, useState, useRef } from "react";
import "./App.css";
import { genGridColors, idxToRowCol, rowColToIdx } from "./utils";
import { HueSquare, type HueSquareData } from "./HueSquare";
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  SQUARE_HEIGHT,
  SQUARE_WIDTH,
} from "./constants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Swap {
  row1: number;
  col1: number;
  row2: number;
  col2: number;
}
const swaps: Swap[] = [
  { row1: 1, col1: 1, row2: 5, col2: 3 },
  { row1: 2, col1: 1, row2: 4, col2: 3 },
  { row1: 3, col1: 1, row2: 3, col2: 3 },
  { row1: 4, col1: 1, row2: 2, col2: 3 },
  { row1: 5, col1: 1, row2: 1, col2: 3 },
];

const pallette1 = ["#ee7d6e", "#387ed9", "#d4dd56", "#22e2ff"];
const pallette2 = ["#f05f5f", "#853aee", "#d4dd56", "#2fe8de"];
const initSquares: HueSquareData[] = genGridColors(
  GRID_WIDTH,
  GRID_HEIGHT,
  "#f15780",
  "#424ae8",
  "#dce64b",
  "#3ae9c9"
)
  .map((hueRow, row) =>
    hueRow.map((squareColor, col) => ({
      color: squareColor,
      id: row * GRID_WIDTH + col,
      currRow: row,
      currCol: col,
      fixed: true,
    }))
  )
  .flat();

// const swapSquarePositions = (
//   squares: HueSquareData[],
//   { row1, row2, col1, col2 }: Swap
// ) => {
//   const idx1 = GRID_WIDTH * row1 + col1;
//   const idx2 = GRID_WIDTH * row2 + col2;

//   // TODO: need to get square at curr col curr row
//   squares[idx1].currCol = col2;
//   squares[idx1].currRow = row2;
//   squares[idx1].fixed = false;

//   squares[idx2].currCol = col1;
//   squares[idx2].currRow = row1;
//   squares[idx1].fixed = false;

//   return squares;
// };

const swapSquarePositions = (
  squares: HueSquareData[],
  { row1, row2, col1, col2 }: Swap
) => {
  // TODO: need to get square at curr col curr row
  const target1 = squares.filter(
    (square) => square.currRow == row1 && square.currCol == col1
  )[0];

  const target2 = squares.filter(
    (square) => square.currRow == row2 && square.currCol == col2
  )[0];

  target1.currCol = col2;
  target1.currRow = row2;
  target1.fixed = false;

  target2.currCol = col1;
  target2.currRow = row1;
  target2.fixed = false;

  return squares;
};

const checkSolved = (squares: HueSquareData[]) => {
  for (const square of squares) {
    const currSquareIdx = square.currRow * GRID_WIDTH + square.currCol;
    if (currSquareIdx !== square.id) {
      console.log("wrong id:", square.id);
      return false;
    }
  }
  return true;
};

const genInitial = (init: HueSquareData[]) => {
  let curr = init;
  for (const swap of swaps) {
    curr = swapSquarePositions(curr, swap);
  }
  return curr;
};

const initPuzzle = genInitial(initSquares);

function App() {
  const container = useRef<HTMLDivElement>(null);
  // TODO: move this call out of component
  const [squares, setSquares] = useState<HueSquareData[]>(initPuzzle);

  const swapSquares = (idxA: number, idxB: number) => {
    setSquares((squares) => {
      const prevSquares = [...squares];
      const aRowCol = idxToRowCol(idxA);
      const bRowCol = idxToRowCol(idxB);
      const newSquares = prevSquares.map((square) => {
        if (rowColToIdx(square.currRow, square.currCol) === idxA) {
          return { ...square, currRow: bRowCol.row, currCol: bRowCol.col };
        } else if (rowColToIdx(square.currRow, square.currCol) == idxB) {
          return { ...square, currRow: aRowCol.row, currCol: aRowCol.col };
        }
        return square;
      });
      return newSquares;
    });
  };

  // check puzzle solved
  useEffect(() => {
    const solved = checkSolved(squares);
    if (solved) {
      console.log("Solved!");
    } else {
      console.log("Not solved :(");
    }
  }, [squares]);

  return (
    <div ref={container} className="game">
      <div
        className="grid"
        style={{
          width: GRID_WIDTH * SQUARE_WIDTH,
          height: GRID_HEIGHT * SQUARE_HEIGHT,
        }}
      >
        {squares.map((square) => (
          <HueSquare onSwap={swapSquares} key={square.id} squareData={square} />
        ))}
      </div>
    </div>
  );
}

export default App;
