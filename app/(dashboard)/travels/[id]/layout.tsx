"use client";

import { ReactNode, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/application/navigation/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { useTravelStore } from "@/stores/travel-store";
import { toast } from "sonner";

interface TravelLayoutProps {
    children: ReactNode;
    breadcrumbs?: ReactNode;
}

export default function TravelLayout({ children }: TravelLayoutProps) {
    const params = useParams();
    const travelId = params?.id as string;
    const { travels, fetchTravels, setCurrentTravel } = useTravelStore();
    const router = useRouter();

    useEffect(() => {
        fetchTravels();
    }, [fetchTravels]);

    useEffect(() => {
        if (!travelId || travels.length === 0) return;
        const current = travels.find((t) => t.id === travelId);
        if (current) {
            setCurrentTravel(current);
        } else {
            toast.error("Oops !", { description: "Le voyage que vous tentez de consulter n'existe pas." });
            router.push("/");
        }
    }, [travelId, travels, setCurrentTravel, router]);

    const currentTitle = travels.find((t) => t.id === travelId)?.title ?? "Chargement...";

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/travels/${travelId}`}>
                                    {currentTitle}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}