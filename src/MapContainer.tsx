import Map, {
  Layer,
  LayerProps,
  MapLayerMouseEvent,
  Source,
  Marker,
  useMap,
  ViewStateChangeEvent,
} from "react-map-gl";
import { useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Feature } from "geojson";
import { DirectionsResponse } from "@mapbox/mapbox-sdk/services/directions";
import Pin from "./Pin";
import { useLocalStorage } from "./useLocalStorage";
import { LngLat, Profile } from "./types";
import { Options } from "./Options";
import { generateRandomPoints } from "./RandomPoints";
import useThrottleCallback from "./useThrottleCallback";
import sortCoordinates from "./sortCoordinates";
import HamburgerMenu from "./HambergerMenu";
import useGeoLocation from "./useGeoLocation";
import Stats, { Summary } from "./Stats";

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN!;

const RoutingStyle: LayerProps = {
  id: "route",
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "#000000",
    "line-width": 4,
    "line-opacity": 0.4,
  },
};

function buildRoutingUrl(
  accessToken: string,
  profile: Profile,
  lngLat: LngLat[]
): string | null {
  if (lngLat.length <= 1) return null;
  const coords = lngLat.map((l) => `${l.lng},${l.lat}`).join(";");
  return `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?access_token=${accessToken}&geometries=geojson&language=ja&alternatives=true&continue_straight=true`;
}

function directionToGeoJSON(
  obj: DirectionsResponse<GeoJSON.LineString>
): Feature {
  const data = obj.routes[0];
  const route = data.geometry.coordinates;
  const geoJSON = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: route,
    },
  };
  return geoJSON;
}

// TODO
// https://docs.mapbox.com/mapbox-gl-js/example/free-camera-path/
// https://docs.mapbox.com/mapbox-gl-js/example/animate-ant-path/
// llm("周辺の証明写真機を最短かつ徒歩で巡りたい。")
// llm("今表示している範囲で、出発地から開始して5km散歩して目的地に付くような、全くランダムな道をだして")
// 一度通った道を避けてほしい。ortoolsでなんとかできないか？

export default function MapContainer() {
  const [location] = useGeoLocation();

  // マップのプロパティ
  const [zoom, setZoom] = useLocalStorage<number>("zoom", 15.16);
  const [initialLngLat, setInitialLngLat] = useLocalStorage<LngLat>(
    "initialLngLat",
    { lng: 135.50136032741636, lat: 34.73652610432653 }
  );

  // 出発, 目的地
  const [profile, setProfile] = useLocalStorage<Profile>("profile", "walking");
  const [start, setStart] = useLocalStorage<LngLat | null>("start", null);
  const [destination, setDestination] = useLocalStorage<LngLat | null>(
    "destination",
    null
  );
  const [userPosition, setUserPosition] = useState<LngLat | null>(null);

  // ランダムなポイント
  const { mainMap } = useMap();
  const [randomPoints, setRandomPoints] = useLocalStorage<LngLat[]>(
    "randomPoints",
    []
  );
  const [routeUpdating, setRouteUpdating] = useLocalStorage(
    "routeUpdating",
    true
  );
  const numRandomPoints = 16;
  const displayRandomPoint = false;

  // 経路
  const [routeGeoJson, setRouteGeoJson] = useLocalStorage<Feature | null>(
    "routeGeoJson",
    null
  );
  const [direction, setDirection] = useLocalStorage<DirectionsResponse<
    GeoJSON.LineString
  > | null>("direction", null);

  // window resizeでチカチカするのでthrottle
  const updateRandomPoints = useThrottleCallback(
    () => {
      if (!mainMap) return;
      const bounds = mainMap.getBounds();
      const newRandomPoints = generateRandomPoints(bounds, numRandomPoints);
      setRandomPoints(newRandomPoints);
    },
    200,
    [mainMap, setRandomPoints]
  );

  // リクエストが発生するのでthrottle
  const updateRoute = useThrottleCallback(
    () => {
      const coords = [];
      if (destination) {
        coords.push({ lng: destination.lng, lat: destination.lat });
      }
      coords.push(...randomPoints);
      if (start) {
        coords.push({ lng: start.lng, lat: start.lat });
      }

      const sortedCoords = sortCoordinates(coords);

      const url = buildRoutingUrl(mapboxAccessToken, profile, sortedCoords);
      if (!url) {
        console.error("!url", profile, coords);
        return;
      }

      fetch(url)
        .then((r) => r.json())
        .then((obj: DirectionsResponse<GeoJSON.LineString>) => {
          setDirection(obj);
          setRouteGeoJson(directionToGeoJSON(obj));
        })
        .catch((e) => {
          console.error(e);
          setDirection(null);
          setRouteGeoJson(null);
        });
    },
    800,
    [destination, profile, randomPoints, setDirection, setRouteGeoJson, start]
  );

  useEffect(() => {
    if (!routeUpdating) return;
    updateRoute();
  }, [routeUpdating, updateRoute]);

  const onMapClick = (e: MapLayerMouseEvent) => {
    const { lng, lat } = e.lngLat;
    const lngLat = { lng, lat };
    if (start === null) {
      setStart(lngLat);
    } else {
      setDestination(lngLat);
    }
  };

  const onZoomEnd = (e: ViewStateChangeEvent) => {
    const newZoom = e.target.getZoom();
    setZoom(newZoom);
    if (newZoom > 13) {
      updateRandomPoints();
    }
  };

  const onMoveEnd = (e: ViewStateChangeEvent) => {
    setInitialLngLat({
      lng: e.viewState.longitude,
      lat: e.viewState.latitude,
    });
    updateRandomPoints();
  };

  // 現在位置
  useEffect(() => {
    if (!location) return;
    setUserPosition({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
  }, [location]);

  // 総距離と時間
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => {
    if (!direction) return;
    const legs = direction.routes[0].legs;
    const durationSum = legs.reduce((acc, l) => acc + l.duration, 0);
    const distanceSum = legs.reduce((acc, l) => acc + l.distance, 0);
    setSummary({ durationSum, distanceSum });
  }, [direction]);

  return (
    <div>
      {summary && <Stats summary={summary} />}
      <HamburgerMenu>
        <Options
          start={start}
          setStart={setStart}
          destination={destination}
          setDestination={setDestination}
          profile={profile}
          setProfile={setProfile}
          routeUpdating={routeUpdating}
          setRouteUpdating={setRouteUpdating}
          onUpdateRandomPositonClicked={() => {
            updateRandomPoints();
            updateRoute(); // todo
          }}
        />
      </HamburgerMenu>
      <Map
        id="mainMap"
        mapLib={import("mapbox-gl")}
        initialViewState={{
          longitude: initialLngLat.lng,
          latitude: initialLngLat.lat,
          zoom: zoom,
        }}
        style={{
          width: "100vw",
          height: "100vh",
        }}
        hash={false}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxAccessToken}
        onClick={onMapClick}
        onZoomEnd={onZoomEnd}
        onMoveEnd={onMoveEnd}
        onLoad={() => {
          if (randomPoints.length === 0) {
            updateRandomPoints();
          }
        }}
      >
        {start && (
          <Marker
            key="start"
            longitude={start.lng}
            latitude={start.lat}
            anchor="center"
            draggable={true}
            onDragEnd={(e) =>
              setStart({ lng: e.lngLat.lng, lat: e.lngLat.lat })
            }
          >
            <Pin color="#ff0000" />
          </Marker>
        )}

        {destination && (
          <Marker
            key="destination"
            longitude={destination.lng}
            latitude={destination.lat}
            anchor="center"
            draggable={true}
            onDragEnd={(e) =>
              setDestination({ lng: e.lngLat.lng, lat: e.lngLat.lat })
            }
          >
            <Pin color="#0000ff" />
          </Marker>
        )}

        {displayRandomPoint &&
          randomPoints.map((l, i) => (
            <Marker
              key={`maker-${i}`}
              longitude={l.lng}
              latitude={l.lat}
              anchor="center"
            >
              <Pin color="#00aa00" />
            </Marker>
          ))}

        {routeGeoJson && (
          <Source id="myRoute" type="geojson" data={routeGeoJson}>
            <Layer {...RoutingStyle} />
          </Source>
        )}

        {userPosition && (
          <Marker
            key={`user-position`}
            longitude={userPosition.lng}
            latitude={userPosition.lat}
            anchor="center"
          >
            <Pin color="#00aa00" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
