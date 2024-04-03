function humanDistance(distance: number): string {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} km`;
  } else {
    return `${distance} m`;
  }
}

function humanDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = Math.round(seconds % 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分${remaining}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${remaining}秒`;
  } else {
    return `${Math.round(seconds)}秒`;
  }
}

export interface Summary {
  durationSum: number;
  distanceSum: number;
}

interface Props {
  summary: Summary;
}

export default function Stats(props: Props) {
  const { summary } = props;
  return (
    <div className="stats">
      <span>{humanDistance(summary.distanceSum)}</span>
      <span>{humanDuration(summary.durationSum)}</span>
    </div>
  );
}
