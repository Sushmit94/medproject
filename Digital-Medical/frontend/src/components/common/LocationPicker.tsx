import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

// Fix Leaflet's default marker icon path issue with bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

// Inner component that handles map click events
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // Centre of India
const DEFAULT_ZOOM = 5;
const PINNED_ZOOM = 16;

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);

  // When saved coords are loaded initially, fly to them
  useEffect(() => {
    if (mapRef.current && lat !== null && lng !== null) {
      mapRef.current.setView([lat, lng], PINNED_ZOOM);
    }
  }, []); // only on mount

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange(latitude, longitude);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], PINNED_ZOOM);
        }
      },
      () => {/* user denied — silently ignore */}
    );
  }, [onChange]);

  const googleMapsUrl =
    lat !== null && lng !== null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-border-light" style={{ height: 320 }}>
        <MapContainer
          center={lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER}
          zoom={lat !== null && lng !== null ? PINNED_ZOOM : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef as any}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onChange={onChange} />
          {lat !== null && lng !== null && (
            <Marker
              position={[lat, lng]}
              draggable
              eventHandlers={{
                dragend(e) {
                  const { lat: newLat, lng: newLng } = (e.target as L.Marker).getLatLng();
                  onChange(newLat, newLng);
                },
              }}
            />
          )}
        </MapContainer>

        {/* "Use my location" button overlaid on map */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          title="Use my current location"
          className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-md border border-border-light rounded-lg text-xs font-medium text-text-primary hover:bg-surface-secondary transition-colors"
        >
          <Navigation size={13} className="text-accent" />
          Use my location
        </button>
      </div>

      {/* Hint */}
      <p className="text-xs text-text-tertiary flex items-center gap-1">
        <MapPin size={12} />
        Click on the map or drag the pin to set your exact location.
      </p>

      {/* Coordinates + Google Maps link */}
      {lat !== null && lng !== null ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-surface-secondary rounded-xl border border-border-light">
          <span className="text-xs text-text-secondary font-mono">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
          <a
            href={googleMapsUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-accent font-medium hover:underline"
          >
            <ExternalLink size={12} />
            View on Google Maps
          </a>
        </div>
      ) : (
        <div className="px-3.5 py-2.5 bg-surface-secondary rounded-xl border border-border-light">
          <span className="text-xs text-text-tertiary">No location pinned yet.</span>
        </div>
      )}
    </div>
  );
}
