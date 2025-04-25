import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// ✅ Importer les icônes manuellement
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapComponent = () => {
  // Definir las ubicaciones para Montreal
  const locations = [
    {
      position: [45.5017, -73.5673],
      name: "Emplacement du centre médical",
    },
    {
      position: [45.5088, -73.5878],
      name: "Mont Royal",
    },
    {
      position: [45.4833, -73.5747],
      name: "Vieux-Montréal",
    },
    {
      position: [45.4711, -73.6143],
      name: "Marché Atwater",
    },
  ];

  return (
    <MapContainer
      center={[45.5017, -73.5673]}
      zoom={12}
      className="h-64 w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {locations.map((location, index) => (
        <Marker key={index} position={location.position} icon={customIcon}>
          <Popup>{location.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
