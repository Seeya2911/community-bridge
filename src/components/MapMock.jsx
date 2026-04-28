import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import StatusBadge from './StatusBadge';
import 'leaflet/dist/leaflet.css';

export default function MapMock({ needs = [], compact = false, onPinClick = null }) {
  // Mumbai approximate center
  const position = [19.0760, 72.8777];

  const getUrgencyColor = (urgency) => {
    if (urgency >= 4) return '#EF4444';
    if (urgency === 3) return '#F59E0B';
    return '#10B981';
  };

  // Derive a stable but unique lat/lng from any string (location name or task id)
  const hashLatLng = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
    const lat = position[0] + ((hash % 200) / 1000) - 0.1;
    const lng = position[1] + (((hash >> 8) % 200) / 1000) - 0.1;
    return [lat, lng];
  };

  return (
    <div className={`w-full overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--cb-border)] ${compact ? 'h-[300px]' : 'h-full'}`}>
      <MapContainer
        center={position}
        zoom={11}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={!compact}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {needs.map((pin) => {
          const [lat, lng] = hashLatLng(pin.location || pin.id || String(Math.random()));
          return (
            <CircleMarker
              key={pin.id}
              center={[lat, lng]}
              pathOptions={{
                color: getUrgencyColor(pin.urgency),
                fillColor: getUrgencyColor(pin.urgency),
                fillOpacity: 0.85,
                weight: 2
              }}
              radius={compact ? 8 : 13}
              eventHandlers={{ click: () => onPinClick && onPinClick(pin.id) }}
            >
              {!compact && (
                <Popup>
                  <div className="p-1 min-w-[150px]">
                    <p className="font-sans text-[14px] font-bold text-slate-800 mb-1">
                      {pin.location || 'Unknown location'}
                    </p>
                    <p className="font-sans text-[12px] text-slate-600 mb-3">
                      {pin.type} — {pin.people_affected || 0} people affected
                    </p>
                    <div className="flex gap-2">
                      <StatusBadge type="urgency" value={pin.urgency} />
                      <StatusBadge type="status" value={pin.status} />
                    </div>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
