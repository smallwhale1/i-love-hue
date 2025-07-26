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

gsap.registerPlugin(useGSAP); // register the hook to avoid React version discrepancies

function App() {
  const container = useRef<HTMLDivElement>(null);
  const [squares, setSquares] = useState<HueSquareData[]>(
    genGridColors(
      GRID_WIDTH,
      GRID_HEIGHT,
      "#ee7d6e",
      "#387ed9",
      "#d4dd56",
      "#22e2ff"
    )
      .map((hueRow, row) =>
        hueRow.map((squareColor, col) => ({
          color: squareColor,
          id: row * GRID_WIDTH + col,
          currRow: row,
          currCol: col,
        }))
      )
      .flat()
  );

  const { contextSafe } = useGSAP(
    () => {
      // gsap code here...
      // gsap.to("#square-0", { x: 100 }); // <-- automatically reverted
    },
    { scope: container }
  ); // <-- scope is for selector text (optional)

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
