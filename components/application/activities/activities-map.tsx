"use client";

import { Card, CardContent } from "@/components/ui/card";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

interface ActivitiesMapProps {
    activities: IActivity[];
}

export default function ActivitiesMap({ activities }: ActivitiesMapProps) {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const markersRef = useRef<mapboxgl.Marker[]>([]);
    
    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
            console.error("Mapbox access token is missing");
            return;
        }

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox/streets-v12",
                center: [2.3522, 48.8566],
                zoom: 4,
            });
            mapRef.current.addControl(new mapboxgl.NavigationControl());
            mapRef.current.addControl(new mapboxgl.FullscreenControl());
        }

        const map = mapRef.current;
        if (!map) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        if (map.getLayer('route-line')) map.removeLayer('route-line');
        if (map.getSource('route-source')) map.removeSource('route-source');

        const validActivities = activities.filter(a => a.latitude != null && a.longitude != null);
        if (validActivities.length === 0) return;

        const datedActivities = validActivities
            .filter(a => a.startDate)
            .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

        const undatedActivities = validActivities.filter(a => !a.startDate);

        datedActivities.forEach((activity, index) => {
            const el = document.createElement('div');
            el.className = "flex items-center justify-center w-8 h-8 font-bold text-white bg-blue-500 rounded-full shadow-lg border-2 border-white";
            el.innerText = `${index + 1}`;

            const popup = new mapboxgl.Popup({ offset: 25 }).setText(activity.title);

            const marker = new mapboxgl.Marker(el)
                .setLngLat([activity.longitude!, activity.latitude!])
                .setPopup(popup)
                .addTo(map);
            markersRef.current.push(marker);
        });

        undatedActivities.forEach(activity => {
            const el = document.createElement('div');
            el.className = "flex items-center justify-center w-8 h-8 font-bold text-white bg-gray-500 rounded-full shadow-lg border-2 border-white";
            el.innerText = "?";

            const popup = new mapboxgl.Popup({ offset: 25 }).setText(activity.title);

            const marker = new mapboxgl.Marker(el)
                .setLngLat([activity.longitude!, activity.latitude!])
                .setPopup(popup)
                .addTo(map);
            markersRef.current.push(marker);
        });

        if (datedActivities.length > 1) {
            const routeCoordinates = datedActivities.map(a => [a.longitude!, a.latitude!]);
            map.on('load', () => {
                if(map.getSource('route-source')) return;

                map.addSource('route-source', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: routeCoordinates,
                        },
                    },
                });

                map.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route-source',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#0ea5e9',
                        'line-width': 3,
                        'line-dasharray': [0, 2],
                    },
                });
            });

             if (map.isStyleLoaded()) {
                if(!map.getSource('route-source')) {
                    map.addSource('route-source', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: routeCoordinates,
                            },
                        },
                    });

                    map.addLayer({
                        id: 'route-line',
                        type: 'line',
                        source: 'route-source',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round',
                        },
                        paint: {
                            'line-color': '#0ea5e9',
                            'line-width': 3
                        },
                    });
                }
            }
        }

        const bounds = new mapboxgl.LngLatBounds();
        validActivities.forEach(activity => {
            bounds.extend([activity.longitude!, activity.latitude!]);
        });

        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 1000 });
        }
    }, [activities]);

    return (
        <Card className="h-fit p-0 overflow-hidden">
            <CardContent className="p-0">
                <div ref={mapContainerRef} className="h-[500px] w-full" />
            </CardContent>
        </Card>
    );
}