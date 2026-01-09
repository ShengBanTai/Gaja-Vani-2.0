import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Red Pointer Icon for User
const RedPointerIcon = L.divIcon({
    className: 'custom-red-pointer',
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff0000" stroke="white" stroke-width="2" width="40" height="40" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40], // Point at the bottom center
    popupAnchor: [0, -40]
});

// Custom Elephant Icon (using a simple divIcon or emoji for now if image invalid, but let's try to style it)
// Ideally we'd use a custom SVG. For now, we use standard marker but maybe color it?
// Let's create a custom div icon later.

function MapEffects({ viewMode, userLocation }) {
    const map = useMap();

    React.useEffect(() => {
        // Force invalidation to ensure map renders correctly in new layout
        map.invalidateSize();
    }, [map]);

    // Fly to user location on first fix
    React.useEffect(() => {
        if (userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], 14, {
                animate: true,
                duration: 2
            });
        }
    }, [map, userLocation?.lat, userLocation?.lng]);

    return null;
}

const MapDisplay = ({ viewMode, data, userLocation }) => {
    const position = [12.2958, 76.6394]; // Mysuru

    return (
        <div className="map-wrapper" style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <MapContainer center={position} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                {/* VIEW MODE TILES */}
                {viewMode === 'normal' ? (
                    <>
                        {/* Satellite Imagery */}
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        />
                        {/* Labels Overlay (Light for visibility) */}
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                    </>
                ) : (
                    /* Dark Matter for Heatmap */
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                )}

                <MapEffects viewMode={viewMode} userLocation={userLocation} />

                {/* User Location Marker & Circle */}
                {userLocation && (
                    <>
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={RedPointerIcon}>
                            <Popup>
                                <div style={{ textAlign: 'center' }}>
                                    <strong>YOU ARE HERE</strong><br />
                                    Accuracy: ±{Math.round(userLocation.accuracy)}m
                                </div>
                            </Popup>
                        </Marker>
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={userLocation.accuracy}
                            pathOptions={{
                                color: '#007bff',
                                fillColor: '#007bff',
                                fillOpacity: 0.1,
                                weight: 1
                            }}
                        />
                        {/* Safety Zone Ring (Hypothetical Safe Buffer) */}
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={500}
                            pathOptions={{
                                color: 'green',
                                fillColor: 'green',
                                fillOpacity: 0.05,
                                weight: 1,
                                dashArray: '5, 10'
                            }}
                        />
                    </>
                )}

                {/* Normal View Layer: Elephant Markers */}
                {viewMode === 'normal' && data.sightings.map(sighting => (
                    <Marker key={sighting.id} position={[sighting.lat, sighting.lng]}>
                        <Popup className="glass-popup">
                            <div style={{ color: 'black' }}>
                                <strong>{sighting.name}</strong><br />
                                Status: {sighting.status}<br />
                                Loc: {sighting.proximity}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Heatmap View Layer: Danger Zones */}
                {viewMode === 'heatmap' && data.dangerZones.map(zone => (
                    <Circle
                        key={zone.id}
                        center={[zone.lat, zone.lng]}
                        pathOptions={{
                            color: zone.intensity === 'High' ? 'red' : 'orange',
                            fillColor: zone.intensity === 'High' ? 'red' : 'orange',
                            fillOpacity: 0.5
                        }}
                        radius={zone.radius}
                        eventHandlers={{
                            mouseover: (e) => e.target.openPopup(),
                            mouseout: (e) => e.target.closePopup(),
                        }}
                    >
                        <Popup>Danger Zone: {zone.intensity} Intensity</Popup>
                    </Circle>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapDisplay;
