import React, { useState } from 'react';
import MapDisplay from '../Map/MapDisplay';
import Sidebar from '../Overlay/Sidebar';
import { sightings, incidents, dangerZones, villageStatus } from '../../data';
import { LayoutGrid, Map as MapIcon, Settings } from 'lucide-react';

const DashboardLayout = () => {

    const [viewMode, setViewMode] = useState('normal'); // 'normal' | 'heatmap'
    const [liveSightings, setLiveSightings] = useState(sightings);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [weatherData, setWeatherData] = useState({ windSpeed: null });

    // Geolocation Watcher
    React.useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed,
                    heading: position.coords.heading
                });
            },
            (error) => {
                console.error("Error fetching location: ", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 60000,
                maximumAge: 0
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Weather Data Fetcher
    React.useEffect(() => {
        if (!userLocation) return;

        const fetchWeather = async () => {
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${userLocation.lat}&longitude=${userLocation.lng}&current=wind_speed_10m&wind_speed_unit=kmh`);
                const data = await response.json();
                if (data.current) {
                    setWeatherData({ windSpeed: data.current.wind_speed_10m });
                }
            } catch (error) {
                console.error("Failed to fetch weather data", error);
            }
        };

        // Fetch immediately and then every 5 minutes
        fetchWeather();
        const interval = setInterval(fetchWeather, 300000);
        return () => clearInterval(interval);
    }, [userLocation?.lat, userLocation?.lng]);

    // Simulate Real-time Movement
    React.useEffect(() => {
        const interval = setInterval(() => {
            setLiveSightings(prev => prev.map(elephant => ({
                ...elephant,
                lat: elephant.lat + (Math.random() - 0.5) * 0.002, // Jitter ~200m
                lng: elephant.lng + (Math.random() - 0.5) * 0.002
            })));
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    const getSignalQuality = (accuracy) => {
        if (!accuracy) return { text: 'NO SIGNAL', color: 'red' };
        if (accuracy < 20) return { text: 'EXCELLENT (GPS)', color: '#00ff00' };
        if (accuracy < 100) return { text: 'GOOD', color: '#ccff00' };
        if (accuracy < 1000) return { text: 'MODERATE', color: 'orange' };
        return { text: 'WEAK (IP-BASED)', color: 'red' };
    };

    return (
        <div className="dashboard-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '1rem', gap: '1rem' }}>

            {/* Header */}
            <header className="glass-panel" style={{ padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--color-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LayoutGrid color="var(--color-primary)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', letterSpacing: '2px', margin: 0 }}>GAJA-VANI <span style={{ color: 'var(--color-primary)' }}>MONITOR</span></h1>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>SYSTEM ONLINE • MYSURU REGION</div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="view-toggle glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setViewMode('normal')}
                        style={{
                            background: viewMode === 'normal' ? 'var(--color-primary)' : 'transparent',
                            color: viewMode === 'normal' ? 'black' : 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                    >
                        Normal View
                    </button>
                    <button
                        onClick={() => setViewMode('heatmap')}
                        style={{
                            background: viewMode === 'heatmap' ? 'var(--color-danger)' : 'transparent',
                            color: viewMode === 'heatmap' ? 'white' : 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s',
                            textShadow: viewMode === 'heatmap' ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
                        }}
                    >
                        Heat Map View
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    <Settings
                        size={20}
                        className="hover-glow"
                        style={{ cursor: 'pointer', transform: showSettings ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }}
                        onClick={() => setShowSettings(!showSettings)}
                    />
                    {showSettings && (
                        <div className="glass-panel" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', padding: '1rem', width: '200px', zIndex: 1000 }}>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Settings</h4>
                            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Notification Sound: ON</div>
                            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Data Refresh: 2s</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Log Out</div>
                        </div>
                    )}
                    <div style={{ width: '30px', height: '30px', background: 'var(--color-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-primary)' }}></div>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden' }}>
                {/* Map Area */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapDisplay viewMode={viewMode} data={{ sightings: liveSightings, dangerZones }} userLocation={userLocation} />

                    {/* Coordinates Display Panel */}
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(10px)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        zIndex: 1000,
                        color: 'white',
                        minWidth: '220px'
                    }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%', boxShadow: '0 0 5px var(--color-primary)' }}></div>
                                LIVE TRAJECTORY
                            </div>
                            {userLocation && (
                                <span style={{ fontSize: '0.6rem', color: getSignalQuality(userLocation.accuracy).color, border: `1px solid ${getSignalQuality(userLocation.accuracy).color}`, padding: '2px 4px', borderRadius: '4px' }}>
                                    {getSignalQuality(userLocation.accuracy).text}
                                </span>
                            )}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>LATITUDE</div>
                                <div>{userLocation?.lat.toFixed(6) || '--.--'}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>LONGITUDE</div>
                                <div>{userLocation?.lng.toFixed(6) || '--.--'}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>ACCURACY</div>
                                <div>{userLocation ? `±${Math.round(userLocation.accuracy)}m` : '--'}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>SPEED</div>
                                <div>{userLocation?.speed ? `${(userLocation.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>WIND SPEED</div>
                                <div style={{ color: '#00d4ff' }}>{weatherData.windSpeed !== null ? `${weatherData.windSpeed} km/h` : '--'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Overlays */}
                <Sidebar incidents={incidents} villageStatus={villageStatus} />

                {/* FAB - Report Incident */}
                <button
                    onClick={() => setShowReportModal(true)}
                    style={{
                        position: 'absolute',
                        bottom: '2rem',
                        right: '25rem', // Positioned left of sidebar
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--color-danger)',
                        border: 'none',
                        boxShadow: '0 0 20px var(--color-danger-glow)',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    +
                </button>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Report Incident</h2>

                        {/* Auto-filled Location */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Detected Location</label>
                            <input
                                type="text"
                                value={userLocation ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` : 'Fetching location...'}
                                readOnly
                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 'bold' }}
                            />
                        </div>

                        <select style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'white' }}>
                            <option>Elephant Sighting</option>
                            <option>Conflict/Damage</option>
                        </select>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowReportModal(false)} style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => { alert(`Report Submitted @ ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Unknown Location'}`); setShowReportModal(false); }} style={{ flex: 1, padding: '0.5rem', background: 'var(--color-primary)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DashboardLayout;
