import React, { useEffect, useRef, useState } from "react";
import { GRID_WIDTH, SQUARE_HEIGHT, SQUARE_WIDTH } from "./constants";
import { rowColToIdx } from "./utils";

export interface HueSquareData {
  color: string;
  id: number;
  currRow: number;
  currCol: number;
}

type HueSquareProps = {
  squareData: HueSquareData;
  onSwap: (idA: number, idB: number) => void;
};

export const HueSquare = ({ squareData, onSwap }: HueSquareProps) => {
  const ref = useRef<null | HTMLDivElement>(null);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);

  const pointerDownRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const onPointerDown = () => {
      pointerDownRef.current = true;
      if (!ref.current) return;
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

      onSwap(
        rowColToIdx(squareData.currRow, squareData.currCol),
        rowColToIdx(swapRow, swapCol)
      );

      setXOffset(0);
      setYOffset(0);

      ref.current.style.transition = "transform 0.5s ease";
      setTimeout(() => {
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
      id={`square-${squareData.id}`}
      ref={ref}
      className="hue-square"
      style={{
        transform: `translate(${
          squareData.currCol * SQUARE_WIDTH + xOffset
        }px, ${squareData.currRow * SQUARE_HEIGHT + yOffset}px)`,
        backgroundColor: squareData.color,
        width: SQUARE_WIDTH,
        height: SQUARE_HEIGHT,
      }}
    ></div>
  );
};
