import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ChangeMapView({ coords }) {
  const map = useMap();
  if (coords) map.setView(coords, 13);
  return null;
}

function App() {
  const [cafes, setCafes] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(null);
  const [filteredCafes, setFilteredCafes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/cafes")
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("❌ Error fetching cafes:", err));
  }, []);

  const handleSearch = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newLoc = { lat, lng };
        setLocation(newLoc);

        const nearby = cafes.filter((cafe) => {
          const dist = getDistance(
            lat,
            lng,
            cafe.location.lat,
            cafe.location.lng
          );
          return dist <= 5;
        });

        setFilteredCafes(nearby);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>☕ Cafe Finder</h2>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter a location (e.g. Pune)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", width: "250px", marginRight: "8px" }}
        />
        <button onClick={handleSearch} style={{ padding: "0.5rem 1rem" }}>
          🔍 Search
        </button>
      </div>

      <MapContainer
        center={location || [18.5204, 73.8567]}
        zoom={13}
        style={{ height: "60vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {location && <ChangeMapView coords={[location.lat, location.lng]} />}

        {filteredCafes.map((cafe, index) => (
          <Marker
            key={index}
            position={[cafe.location.lat, cafe.location.lng]}
          >
            <Popup>
              <b>{cafe.name}</b>
              <br />
              📍 {cafe.address}
              <br />
              ⭐ {cafe.rating} | {cafe.category}
              <br />
              🍽️ {cafe.best_dishes.join(", ")}
              <br />
              <a href={cafe.website} target="_blank" rel="noreferrer">
                🌐 Visit Website
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {filteredCafes.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>📍 Cafes near {search}</h3>
          <ul>
            {filteredCafes.map((cafe, index) => (
              <li key={index} style={{ marginBottom: "1rem" }}>
                <b>{cafe.name}</b> – {cafe.address} <br />
                ⭐ {cafe.rating} | {cafe.category} <br />
                🍽️ {cafe.best_dishes.join(", ")} <br />
                🌐{" "}
                <a href={cafe.website} target="_blank" rel="noreferrer">
                  {cafe.website}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
