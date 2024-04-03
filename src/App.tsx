import "./App.css";

import { MapProvider } from "react-map-gl";
import MapContainer from "./MapContainer";

function App() {
  return (
    <MapProvider>
      <MapContainer />
    </MapProvider>
  );
}

export default App;
