import { useEffect, useRef, useState } from "react";
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  SQUARE_HEIGHT,
  SQUARE_WIDTH,
} from "./constants";
import { rowColToIdx } from "./utils";

export interface HueSquareData {
  color: string;
  id: number;
  currRow: number;
  currCol: number;
  fixed: boolean;
}

type HueSquareProps = {
  squareData: HueSquareData;
  onSwap: (idA: number, idB: number) => void;
};

export const HueSquare = ({ squareData, onSwap }: HueSquareProps) => {
  const ref = useRef<null | HTMLDivElement>(null);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const [scale, setScale] = useState(0);

  const pointerDownRef = useRef(false);

  useEffect(() => {
    const delay =
      50 + (squareData.currRow * GRID_WIDTH + squareData.currCol) * 50;
    const timeout = setTimeout(() => {
      setScale(1);
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const onPointerDown = () => {
      pointerDownRef.current = true;
      if (!ref.current) return;
      setScale(1.1);
      ref.current.style.zIndex = "1";
      ref.current.style.transition = "none";
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;
      if (!ref.current) return;
      const parent = ref.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      let offsetY = e.clientY - rect.top;

      const swapRow = Math.floor(offsetY / SQUARE_HEIGHT);
      const swapCol = Math.floor(offsetX / SQUARE_WIDTH);

      const isValid =
        swapRow >= 0 &&
        swapRow < GRID_HEIGHT &&
        swapCol >= 0 &&
        swapCol < GRID_WIDTH;

      if (isValid) {
        onSwap(
          rowColToIdx(squareData.currRow, squareData.currCol),
          rowColToIdx(swapRow, swapCol)
        );
      }

      setXOffset(0);
      setYOffset(0);

      setScale(1);
      ref.current.style.transition = "transform 0.5s ease";
      setTimeout(() => {
        if (!ref.current) return;
        ref.current.style.zIndex = "0";
      }, 500);
    };

    const onPointerMove = (ev: PointerEvent) => {
      {
        if (!pointerDownRef.current) return;
        if (!ref.current) return;
        ref.current.style.zIndex = "10";
        setXOffset((prev) => prev + ev.movementX);
        setYOffset((prev) => prev + ev.movementY);
      }
    };

    ref.current.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      ref.current?.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [squareData]);

  return (
    <div
      ref={ref}
      className="translate-wrapper"
      style={{
        transform: `translate(${
          squareData.currCol * SQUARE_WIDTH + xOffset
        }px, ${squareData.currRow * SQUARE_HEIGHT + yOffset}px)`,
      }}
    >
      <div
        className="hue-square"
        style={{
          transform: `scale(${scale})`,
          backgroundColor: squareData.color,
          width: SQUARE_WIDTH,
          height: SQUARE_HEIGHT,
        }}
      ></div>
    </div>

    // <div
    //   id={`square-${squareData.id}`}
    //   ref={ref}
    //   className="hue-square"
    //   style={{
    //     transform: `translate(${
    //       squareData.currCol * SQUARE_WIDTH + xOffset
    //     }px, ${squareData.currRow * SQUARE_HEIGHT + yOffset}px) scale(${scale}`,
    //     backgroundColor: squareData.color,
    //     width: SQUARE_WIDTH,
    //     height: SQUARE_HEIGHT,
    //   }}
    // ></div>
  );
};
