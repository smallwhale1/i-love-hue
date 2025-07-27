import { useEffect, useState, useRef } from "react";
import "./App.css";
import { genGridColors, idxToRowCol, rowColToIdx } from "./utils";
import { HueSquare, type HueSquareData } from "./HueSquare";
// import {
//   GRID_HEIGHT,
//   GRID_WIDTH,
//   SQUARE_HEIGHT,
//   SQUARE_WIDTH,
// } from "./constants";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeartIcon from "./Heart";

interface Swap {
  row1: number;
  col1: number;
  row2: number;
  col2: number;
}
const swaps: Swap[] = [
  { row1: 1, col1: 1, row2: 3, col2: 5 },
  { row1: 2, col1: 1, row2: 2, col2: 5 },
  { row1: 3, col1: 1, row2: 1, col2: 5 },
];
const swapsVertical: Swap[] = [
  { row1: 1, col1: 1, row2: 5, col2: 3 },
  { row1: 2, col1: 1, row2: 4, col2: 3 },
  { row1: 3, col1: 1, row2: 3, col2: 3 },
  { row1: 4, col1: 1, row2: 2, col2: 3 },
  { row1: 5, col1: 1, row2: 1, col2: 3 },
];

// const swaps: Swap[] = [
// { row1: 1, col1: 1, row2: 3, col2: 9 },
// { row1: 1, col1: 2, row2: 2, col2: 9 },
// { row1: 2, col1: 2, row2: 1, col2: 9 },
// { row1: 3, col1: 2, row2: 1, col2: 7 },
// { row1: 1, col1: 3, row2: 2, col2: 8 },
// { row1: 1, col1: 5, row2: 2, col2: 7 },
// ];

const pallette1 = ["#ee7d6e", "#387ed9", "#d4dd56", "#22e2ff"];
const pallette2 = ["#f05f5f", "#853aee", "#d4dd56", "#2fe8de"];

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

const checkSolved = (squares: HueSquareData[], gridWidth: number) => {
  for (const square of squares) {
    const currSquareIdx = square.currRow * gridWidth + square.currCol;
    if (currSquareIdx !== square.id) {
      console.log("wrong id:", square.id);
      return false;
    }
  }
  return true;
};

const genInitial = (init: HueSquareData[], swaps: Swap[]) => {
  let curr = init;
  for (const swap of swaps) {
    curr = swapSquarePositions(curr, swap);
  }
  return curr;
};

function App() {
  const container = useRef<HTMLDivElement>(null);
  // TODO: move this call out of component
  const [squares, setSquares] = useState<HueSquareData[]>([]);
  const [squareWidth, setSquareWidth] = useState(window.innerWidth / 7);
  const [squareHeight, setSquareHeight] = useState(window.innerHeight / 5);
  const [solved, setSolved] = useState(false);
  const [gridWidth, setGridWidth] = useState(7);
  const [gridHeight, setGridHeight] = useState(5);

  useEffect(() => {
    const result = checkSolved(squares, gridWidth);
    setSolved(result);
  }, [squares, gridWidth]);

  useEffect(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let newWidth = 7;
    let newHeight = 5;

    if (windowWidth < windowHeight) {
      newWidth = 5;
      newHeight = 7;
      setGridWidth(5);
      setGridHeight(7);
    }

    setSquareWidth(window.innerWidth / newWidth);
    setSquareHeight(window.innerHeight / newHeight);

    const initSquares: HueSquareData[] = genGridColors(
      newWidth,
      newHeight,
      "#f15780",
      "#424ae8",
      "#dce64b",
      "#3ae9c9"
    )
      .map((hueRow, row) =>
        hueRow.map((squareColor, col) => ({
          color: squareColor,
          id: row * newWidth + col,
          currRow: row,
          currCol: col,
          fixed: true,
        }))
      )
      .flat();

    let initPuzzle = [];
    if (windowWidth < windowHeight) {
      initPuzzle = genInitial(initSquares, swapsVertical);
    } else {
      initPuzzle = genInitial(initSquares, swaps);
    }

    setSquares(initPuzzle);
  }, []);

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
    const solved = checkSolved(squares, gridWidth);
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
          width: gridWidth * squareWidth,
          height: gridHeight * squareHeight,
        }}
      >
        {squares.map((square) => (
          <HueSquare
            squareWidth={squareWidth}
            squareHeight={squareHeight}
            onSwap={swapSquares}
            key={square.id}
            squareData={square}
            gridWidth={gridWidth}
            gridHeight={gridHeight}
          />
        ))}
      </div>
      <HeartIcon className={solved ? "heart-icon visible" : "heart-icon"} />
    </div>
  );
}

export default App;
