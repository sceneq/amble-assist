import { LngLatBounds } from "react-map-gl";
import { LngLat } from "./types";

//
export function generateRandomPoints(
  bounds: LngLatBounds,
  numRandomPoints: number
): LngLat[] {
  const n = bounds.getNorth();
  const e = bounds.getEast();
  const s = bounds.getSouth();
  const w = bounds.getWest();

  const newRandomPoints = [];

  // // 等間隔のグリッドに分割
  // const latDiff = n - s;
  // const lngDiff = e - w;
  // const idealCellArea = (latDiff * lngDiff) / numRandomPoints;
  // const idealCellSideLength = Math.sqrt(idealCellArea);
  // const numRows = Math.floor(latDiff / idealCellSideLength);
  // const numCols = Math.floor(numRandomPoints / numRows);
  // const latStep = (n - s) / numRows;
  // const lngStep = (e - w) / numCols;
  // for (let row = 0; row < numRows; row++) {
  //   for (let col = 0; col < numCols; col++) {
  //     if (Math.random() > 0.5) continue;
  //     const lat = s + (row + Math.random()) * latStep;
  //     const lng = w + (col + Math.random()) * lngStep;
  //     newRandomPoints.push({ lat, lng });
  //   }
  // }

  // 残りの点
  const coef = 0.8;
  const remainingPoints = numRandomPoints - newRandomPoints.length;
  const midX = (e + w) / 2;
  const midY = (s + n) / 2;
  const rangeX = ((w - e) * coef) / 2;
  const rangeY = ((n - s) * coef) / 2;

  for (let i = 0; i < remainingPoints; i++) {
    const lng = midX + (Math.random() * 2 - 1) * rangeX;
    const lat = midY + (Math.random() * 2 - 1) * rangeY;
    newRandomPoints.push({ lng, lat });
  }

  return newRandomPoints;
}
