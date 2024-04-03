import { useState, useEffect } from "react";

export default function useGeoLocation(
  options?: PositionOptions
): [GeolocationPosition | null, GeolocationPositionError | null] {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  useEffect(() => {
    const handlePermission = async () => {
      const { state } = await navigator.permissions.query({
        name: "geolocation",
      });

      if (state === "granted") {
        return;
      } else if (state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(position);
            setError(null);
          },
          (err) => {
            console.error(err);
            setError(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000,
            ...options,
          }
        );
      } else {
        // "denied"
      }
    };

    handlePermission();

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000, ...options }
    );

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, [options]);

  return [location, error];
}
