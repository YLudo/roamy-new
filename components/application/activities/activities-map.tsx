"use client";

import { Card, CardContent } from "@/components/ui/card";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

export default function ActivitiesMap() {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
            console.error("Mapbox access token is missing");
            return;
        }

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        if (mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox/streets-v12",
                center: [2.3522, 48.8566],
                zoom: 2,
            });

            mapRef.current.addControl(new mapboxgl.FullscreenControl());
        }

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <Card className="h-fit p-0 overflow-hidden">
            <CardContent className="p-0">
                <div ref={mapContainerRef} className="h-[500px] w-full" />
            </CardContent>
        </Card>
    );
}