import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import StatusBadge from './StatusBadge';
import 'leaflet/dist/leaflet.css';

export default function MapMock({ needs = [], compact = false, onPinClick = null }) {
  // Mumbai approximate center
  const position = [19.0760, 72.8777];

  const getUrgencyColor = (urgency) => {
    if (urgency >= 4) return '#EF4444'; // cb-critical
    if (urgency === 3) return '#F59E0B'; // cb-moderate
    return '#10B981'; // cb-low
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
          // Approximate mapping of SVGy to lat/lng for visual effect since mock data has no lat/lng
          // Dharavi ~19.0380, 72.8538
          let lat = 19.0760 + ((pin.svgY || 250) - 250) * -0.0005; // reverse Y for lat
          let lng = 72.8777 + ((pin.svgX || 250) - 250) * 0.0005; 
          
          return (
            <CircleMarker 
              key={pin.id}
              center={[lat, lng]}
              pathOptions={{ 
                color: getUrgencyColor(pin.urgency), 
                fillColor: getUrgencyColor(pin.urgency), 
                fillOpacity: 0.8,
                weight: 2
              }}
              radius={compact ? 8 : 12}
              eventHandlers={{
                click: () => onPinClick && onPinClick(pin.id)
              }}
            >
              {!compact && (
                <Popup>
                  <div className="p-1 min-w-[120px]">
                    <p className="font-sans text-[14px] font-bold text-slate-800 mb-1">{pin.location}</p>
                    <p className="font-sans text-[12px] text-slate-600 mb-3">{pin.needType} ({pin.people} people)</p>
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
