"use client";

import { Bell, LogOut, Plane, Settings, User } from "lucide-react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateTripStepper from "@/components/application/trips/create-trip-stepper";
import TripsList from "@/components/application/trips/trips-list";
import { pusherClient } from "@/lib/pusher";
import { useTravelStore } from "@/stores/travel-store";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { travels, fetchTravels, isLoading } = useTravelStore();

    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchTravels();
    }, [fetchTravels]);

    useEffect(() => {
        if (!session?.user.id) return;

        const channelName = `user-${session?.user.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("travels:new", () => {
            fetchTravels();
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(channelName);
        }
    }, [fetchTravels, session?.user.id]);

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
        }

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    const handleSignOut = () => {
        signOut({ callbackUrl: "/login" });
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-6 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <Plane className="size-4" />
                        </div>
                        Roamy
                    </Link>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Bonjour, <span className="text-primary">{session?.user.name}</span></h1>
                <div className="flex-1">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl text-foreground font-medium">Mes voyages</h2>
                            <CreateTripStepper />
                        </div>
                        <TripsList isLoading={isLoading} travels={travels} />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-6 border-t">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="justify-start gap-3 h-auto p-3">
                                <Avatar className="size-8">
                                    <AvatarImage src="" alt={session?.user?.name || "John Doe"} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {session?.user?.name ? session.user.name.charAt(0) : "J"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-sm font-medium">{session?.user?.name || "John Doe"}</span>
                                    <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start" side="top">
                            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="#" className="flex items-center gap-2 cursor-pointer">
                                    <User className="size-4" />
                                    Mon profil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="#" className="flex items-center gap-2 cursor-pointer">
                                <Settings className="size-4" />
                                Paramètres
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="#" className="flex items-center gap-2 cursor-pointer">
                                <Bell className="size-4" />
                                Notifications
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                                <LogOut className="size-4 text-destructive" />
                                Se déconnecter
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Roamy. Tous droits réservés.</p>
                </div>
            </div>
            <div className="relative hidden lg:block">
                <div
                    ref={mapContainerRef}
                    className="w-full h-full absolute inset-0"
                ></div>
            </div>
        </div>
    );
}
