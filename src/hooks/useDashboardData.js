import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useDashboardData = () => {
    const [sightings, setSightings] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [dangerZones, setDangerZones] = useState([]);
    const [villageStatus, setVillageStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to format timestamp to "HH:MM AM/PM"
    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [
                    { data: sightingsData, error: sightingsError },
                    { data: incidentsData, error: incidentsError },
                    { data: dangerZonesData, error: dangerZonesError },
                    { data: villageStatusData, error: villageStatusError }
                ] = await Promise.all([
                    supabase.from('sightings').select('*'),
                    supabase.from('incidents').select('*').order('created_at', { ascending: false }),
                    supabase.from('danger_zones').select('*'),
                    supabase.from('village_status').select('*')
                ]);

                if (sightingsError) throw sightingsError;
                if (incidentsError) throw incidentsError;
                if (dangerZonesError) throw dangerZonesError;
                if (villageStatusError) throw villageStatusError;

                setSightings(sightingsData || []);
                setIncidents(incidentsData?.map(i => ({ ...i, time: formatTime(i.time) })) || []);
                setDangerZones(dangerZonesData || []);
                setVillageStatus(villageStatusData || []);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime Subscriptions
        // Note: For 'postgres_changes' to work, Realtime must be enabled for these tables in the Supabase Dashboard
        const channels = supabase.channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sightings' },
                (payload) => {
                    console.log('Realtime change sightings:', payload);
                    if (payload.eventType === 'INSERT') {
                        setSightings((prev) => [...prev, payload.new]);
                    } else if (payload.eventType === 'UPDATE') {
                        setSightings((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)));
                    } else if (payload.eventType === 'DELETE') {
                        setSightings((prev) => prev.filter((item) => item.id !== payload.old.id));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'village_status' },
                (payload) => {
                    console.log('Realtime change village_status:', payload);
                    if (payload.eventType === 'INSERT') {
                        setVillageStatus((prev) => [...prev, payload.new]);
                    } else if (payload.eventType === 'UPDATE') {
                        setVillageStatus((prev) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)));
                    } else if (payload.eventType === 'DELETE') {
                        setVillageStatus((prev) => prev.filter((item) => item.id !== payload.old.id));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'incidents' },
                (payload) => {
                    console.log('Realtime change incidents:', payload);
                    const newIncident = { ...payload.new, time: formatTime(payload.new.time) };
                    setIncidents((prev) => [newIncident, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channels);
        };
    }, []);

    return { sightings, incidents, dangerZones, villageStatus, loading, error };
};
