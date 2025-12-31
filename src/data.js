export const sightings = [
    { id: 1, lat: 12.25, lng: 76.60, name: "Gaja-01", status: "Active", proximity: "Nanjangud Rd" },
    { id: 2, lat: 12.28, lng: 76.55, name: "Gaja-03", status: "Active", proximity: "Hunsur" },
    { id: 3, lat: 12.22, lng: 76.65, name: "Gaja-04", status: "Roaming", proximity: "Bandipur Fringe" },
];

export const incidents = [
    { id: 1, time: "10:45 AM", description: "Elephant sighting near Nanjangud Rd", type: "sighting" },
    { id: 2, time: "10:42 AM", description: "Crop damage reported in Hunsur village", type: "conflict" },
    { id: 3, time: "09:15 AM", description: "Herd movement detected near Kabini", type: "movement" },
    { id: 4, time: "08:30 AM", description: "Sensor trigger at Checkpost 4", type: "alert" },
];

export const dangerZones = [
    { id: 1, lat: 12.25, lng: 76.60, radius: 1500, intensity: "High" },
    { id: 2, lat: 12.28, lng: 76.55, radius: 1000, intensity: "Medium" },
];

export const villageStatus = [
    { name: "Nanjangud Rd", status: "Safe", color: "green" },
    { name: "Hunsur", status: "Warning", color: "yellow" },
    { name: "Kabini Outpost", status: "Danger", color: "red" },
    { name: "Village Rd", status: "Safe", color: "green" },
];
