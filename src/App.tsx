import { useEffect, useState, useRef } from "react";
import "./App.css";
import { genGridColors, idxToRowCol, rowColToIdx } from "./utils";
import { HueSquare, type HueSquareData } from "./HueSquare";
import HeartIcon from "./Heart";
import { GRID_HEIGHT, GRID_WIDTH } from "./constants";

interface Swap {
  row1: number;
  col1: number;
  row2: number;
  col2: number;
}

// const swaps: Swap[] = [
//   { row1: 1, col1: 1, row2: 3, col2: 5 },
//   { row1: 2, col1: 1, row2: 2, col2: 5 },
//   { row1: 3, col1: 1, row2: 1, col2: 5 },
// ];

function generateSwaps(
  n: number,
  minRow: number,
  minCol: number,
  maxRow: number,
  maxCol: number
): Swap[] {
  const swaps: Swap[] = [];

  for (let i = 0; i < n; i++) {
    const row1 = randInt(minRow, maxRow);
    const col1 = randInt(minCol, maxCol);

    let row2 = randInt(minRow, maxRow);
    let col2 = randInt(minCol, maxCol);

    // ensure swap target isn't same as source
    while (row1 === row2 && col1 === col2) {
      row2 = randInt(minRow, maxRow);
      col2 = randInt(minCol, maxCol);
    }

    swaps.push({ row1, col1, row2, col2 });
  }

  return swaps;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const swaps1 = generateSwaps(5, 1, 1, 3, 5);
console.log(swaps1);

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const result = checkSolved(squares, GRID_WIDTH);
    setSolved(result);
  }, [squares]);

  useEffect(() => {
    setSquareWidth(window.innerWidth / GRID_WIDTH);
    setSquareHeight(window.innerHeight / GRID_HEIGHT);

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

    const swaps1 = generateSwaps(50, 1, 1, GRID_WIDTH - 2, GRID_HEIGHT - 2);
    console.log(swaps1);
    const initPuzzle = genInitial(initSquares, swaps1);

    setSquares(initPuzzle);
    setLoaded(true);
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

  // // check puzzle solved
  // useEffect(() => {
  //   const solved = checkSolved(squares, GRID_WIDTH);
  //   if (solved) {
  //     console.log("Solved!");
  //   } else {
  //     console.log("Not solved :(");
  //   }
  // }, [squares]);

  return (
    <div ref={container} className="game">
      <div
        className="grid"
        style={{
          width: GRID_WIDTH * squareWidth,
          height: GRID_HEIGHT * squareHeight,
        }}
      >
        {squares.map((square) => (
          <HueSquare
            squareWidth={squareWidth}
            squareHeight={squareHeight}
            onSwap={swapSquares}
            key={square.id}
            squareData={square}
            gridWidth={GRID_WIDTH}
            gridHeight={GRID_HEIGHT}
          />
        ))}
      </div>
      <HeartIcon
        className={solved && loaded ? "heart-icon visible" : "heart-icon"}
      />
    </div>
  );
}

export default App;
