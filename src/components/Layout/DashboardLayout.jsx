import React, { useState, useEffect } from 'react';
import MapDisplay from '../Map/MapDisplay';
import Sidebar from '../Overlay/Sidebar';
import { useDashboardData } from '../../hooks/useDashboardData';
import { LayoutGrid, Map as MapIcon, Settings, Navigation, AlertTriangle, CloudRain } from 'lucide-react';

const DashboardLayout = () => {

    const { sightings, incidents, dangerZones, villageStatus, loading } = useDashboardData();
    const [viewMode, setViewMode] = useState('normal'); // 'normal' | 'heatmap'
    const [liveSightings, setLiveSightings] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [isFollowing, setIsFollowing] = useState(true);
    const [weatherData, setWeatherData] = useState({ windSpeed: null });

    // Sync fetched sightings with local state for simulation
    useEffect(() => {
        if (sightings && sightings.length > 0) {
            setLiveSightings(sightings);
        }
    }, [sightings]);

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
                timeout: 5000,
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


    // Mobile Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            {/* Header */}
            <header className="glass-panel dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="menu-toggle mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ cursor: 'pointer' }}>
                        <div style={{ width: '24px', height: '2px', background: 'white', marginBottom: '5px' }}></div>
                        <div style={{ width: '24px', height: '2px', background: 'white', marginBottom: '5px' }}></div>
                        <div style={{ width: '24px', height: '2px', background: 'white' }}></div>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.8rem' }}>🐘</span> Gaja-Vani Monitor
                        </h1>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ff41', boxShadow: '0 0 5px #00ff41' }}></div>
                            SYSTEM ONLINE • MYSURU REGION
                        </div>
                    </div>
                </div>

                <div className="view-toggle" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setViewMode('normal')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'normal' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                            color: viewMode === 'normal' ? 'black' : 'white',
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
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'heatmap' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                            color: viewMode === 'heatmap' ? 'black' : 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                    >
                        Heat Map
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="map-section glass-panel">
                    <div className="map-wrapper">
                        <MapDisplay
                            viewMode={viewMode}
                            data={{ sightings: liveSightings, dangerZones }}
                            userLocation={userLocation}
                            isFollowing={isFollowing}
                            onMapDrag={() => setIsFollowing(false)}
                        />
                    </div>

                    {/* FAB for Reporting */}
                    <button
                        className="fab-report"
                        onClick={() => setShowReportModal(true)}
                        title="Report Incident"
                    >
                        <AlertTriangle size={24} />
                    </button>

                    {/* Coordinates Panel */}
                    <div className="coordinates-panel glass-panel" style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.8rem',
                        zIndex: 1000,
                        minWidth: '150px'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>YOUR LOCATION</div>
                        <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                            {userLocation ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` : 'Locating...'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CloudRain size={12} /> {weatherData.windSpeed ? `${weatherData.windSpeed} km/h` : 'Loading...'}
                        </div>
                    </div>
                </div>

                <Sidebar
                    incidents={incidents}
                    villageStatus={villageStatus}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            {/* Modal */}
            {showReportModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
                        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle /> Report Sighting
                        </h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Location</label>
                            <input
                                type="text"
                                value={userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Unknown'}
                                disabled
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Description (Optional)</label>
                            <textarea
                                placeholder="Describe the elephant activity..."
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', minHeight: '100px' }}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowReportModal(false)}
                                style={{ padding: '0.8rem 1.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Report Submitted! Nearby villages will be alerted.');
                                    setShowReportModal(false);
                                }}
                                style={{ padding: '0.8rem 1.5rem', borderRadius: '4px', border: 'none', background: 'var(--color-danger)', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 10px var(--color-danger-glow)' }}
                            >
                                Submit Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
