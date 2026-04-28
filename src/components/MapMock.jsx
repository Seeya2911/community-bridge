import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import StatusBadge from './StatusBadge';

export default function MapMock({ needs = [], compact = false, onPinClick = null }) {
  const center = [19.076, 72.8777];

  const getUrgencyColor = (urgency) => {
    if (urgency >= 4) return '#EF4444';
    if (urgency === 3) return '#F59E0B';
    return '#10B981';
  };

  const hashLatLng = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
    const lat = center[0] + ((hash % 220) / 1000) - 0.11;
    const lng = center[1] + (((hash >> 8) % 220) / 1000) - 0.11;
    return [lat, lng];
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-white/10 shadow-[var(--shadow-card)] ${compact ? 'h-[300px]' : 'h-full min-h-[520px]'} bg-slate-950`}>
      <div className="absolute left-4 top-4 z-[500] rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-sm">
        Mumbai Operations Map
      </div>
      <div className="absolute right-4 top-4 z-[500] rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-100 backdrop-blur-sm">
        {needs.length ? 'Incidents online' : 'No active incidents'}
      </div>

      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        style={{ minHeight: compact ? 300 : 520, zIndex: 0 }}
        zoomControl={!compact}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {needs.map((pin) => {
          const [lat, lng] = hashLatLng(pin.location || pin.id || String(Math.random()));
          const color = getUrgencyColor(pin.urgency);
          return (
            <CircleMarker
              key={pin.id}
              center={[lat, lng]}
              radius={compact ? 8 : 12}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: color,
                fillOpacity: 0.92
              }}
              eventHandlers={{ click: () => onPinClick && onPinClick(pin.id) }}
            >
              {!compact && (
                <Popup>
                  <div className="p-1 min-w-[160px]">
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

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
        <span>{needs.length} active incident pins</span>
        <span>Pan, zoom, and tap the markers</span>
      </div>
    </div>
  );
}
