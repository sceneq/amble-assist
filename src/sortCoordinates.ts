interface LngLat {
  lng: number;
  lat: number;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function calcDistance(p1: LngLat, p2: LngLat): number {
  // delta
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);

  //
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);

  // haversine
  const hLat = Math.sin(dLat / 2) ** 2;
  const hLng = Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const hSum = hLat + hLng;

  const angle = 2 * Math.atan2(Math.sqrt(hSum), Math.sqrt(1 - hSum));

  return 6371 * angle;
}

// coordsの中間の要素のみソートする。
export default function sortCoordinates(coords: LngLat[]): LngLat[] {
  if (coords.length < 3) {
    return coords;
  }

  const start = coords[0];
  const end = coords[coords.length - 1];

  const sorted = coords.slice(1, coords.length - 1).sort((a, b) => {
    const distanceA = calcDistance(start, a);
    const distanceB = calcDistance(start, b);
    return distanceA - distanceB;
  });

  const rearrangedPath = [start, ...sorted, end];

  return rearrangedPath;
}
