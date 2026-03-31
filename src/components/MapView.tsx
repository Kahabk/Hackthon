import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Map as MapIcon, Satellite, LocateFixed, Pencil, Trash2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onAreaSelect?: (area: number) => void;
  lat: number;
  lng: number;
}

// Helper to update map center when props change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Helper to handle clicks
function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ onLocationSelect, onAreaSelect, lat, lng }: MapViewProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');
  const [isDrawing, setIsDrawing] = useState(false);

  // Tile layers
  const roadmapUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0];
      const area = L.GeometryUtil.geodesicArea(latlngs);
      if (onAreaSelect) onAreaSelect(area);
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
      <MapContainer 
        center={[lat, lng]} 
        zoom={15} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ChangeView center={[lat, lng]} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapType === 'roadmap' ? roadmapUrl : satelliteUrl}
        />
        
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={_onCreated}
            draw={{
              rectangle: false,
              circle: false,
              polyline: false,
              circlemarker: false,
              marker: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#e1e1e1',
                  message: '<strong>Error:<strong> Polygon edges cannot cross!'
                },
                shapeOptions: {
                  color: '#10B981'
                }
              }
            }}
          />
        </FeatureGroup>

        <Marker position={[lat, lng]} />
        <LocationMarker onSelect={onLocationSelect} />
      </MapContainer>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setMapType('roadmap')}
            className={`p-2 rounded-lg glass transition-all ${mapType === 'roadmap' ? 'bg-brand-blue/40 border-brand-blue' : 'hover:bg-white/10'}`}
            title="Roadmap View"
          >
            <MapIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`p-2 rounded-lg glass transition-all ${mapType === 'satellite' ? 'bg-brand-blue/40 border-brand-blue' : 'hover:bg-white/10'}`}
            title="Satellite View"
          >
            <Satellite className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-4 left-4 z-10 glass px-4 py-2 rounded-lg text-xs font-mono text-white/70 flex items-center gap-2">
        <LocateFixed className="w-3 h-3 text-brand-green" />
        {lat.toFixed(6)}, {lng.toFixed(6)}
      </div>

      {/* Notice Overlay */}
      <div className="absolute top-4 right-12 z-10 glass px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
        <Pencil className="w-3 h-3 text-brand-green" />
        Draw Polygon to select Area
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-bg/40 to-transparent z-[5]" />
    </div>
  );
}
