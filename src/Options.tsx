import "mapbox-gl/dist/mapbox-gl.css";
import { LngLat, Profile } from "./types";
import ClearableReadonlyTextBox from "./ClearableReadonlyInput";

function lngLatDisplay(l: LngLat): string {
  const lng = l.lng.toFixed(4);
  const lat = l.lat.toFixed(4);
  return `${lng},${lat}`;
}

// 分離する必要ある？

interface Props {
  start: LngLat | null;
  destination: LngLat | null;
  profile: Profile;
  routeUpdating: boolean;
  setStart: (v: LngLat | null) => void;
  setDestination: (v: LngLat | null) => void;
  setProfile: (v: Profile) => void;
  setRouteUpdating: (v: boolean) => void;
  onUpdateRandomPositonClicked: () => void;
}

export function Options(props: Props) {
  const {
    start,
    destination,
    profile,
    routeUpdating,
    setStart,
    setDestination,
    setProfile,
    setRouteUpdating,
    onUpdateRandomPositonClicked,
  } = props;

  return (
    <div className="options">
      <div className="option">
        <label htmlFor="routeUpdating">経路更新(自動)</label>
        <input
          id="routeUpdating"
          type="checkbox"
          checked={routeUpdating}
          onChange={() => setRouteUpdating(!routeUpdating)}
        />
      </div>
      <div className="option">
        <input
          type="button"
          value="経路更新(手動)"
          onClick={() => onUpdateRandomPositonClicked()}
        />
      </div>
      <div className="option">
        <select
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value as Profile)}
        >
          <option value="walking">歩き</option>
          <option value="cycling">チャリ</option>
        </select>
      </div>
      <div className="option">
        <label>出発地</label>
        <ClearableReadonlyTextBox
          value={start ? lngLatDisplay(start) : "None"}
          onClearClick={() => setStart(null)}
        />
      </div>
      <div className="option">
        <label>目的地</label>
        <ClearableReadonlyTextBox
          value={destination ? lngLatDisplay(destination) : "None"}
          onClearClick={() => setDestination(null)}
        />
      </div>
    </div>
  );
}
