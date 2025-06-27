"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronsUpDown, Plane } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TravelSwitcher({
    travels
}: {
    travels: ITravel[];
}) {
    const { isMobile } = useSidebar();
    const pathname = usePathname();
    const router = useRouter();

    const activeTravel = travels.find((travel) =>
        pathname.includes(`/travels/${travel.id}`)
    );

    if (!activeTravel) {
        return <Skeleton className="w-full h-12" />
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Plane className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{activeTravel.title}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                       <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Voyages
                        </DropdownMenuLabel>
                        {travels.map((travel, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => router.push(`/travels/${travel.id}`)}
                                className="cursor-pointer p-2"
                            >
                                {travel.title}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer p-2">
                            <Link href="/" className="flex items-center gap-2 w-full">
                                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                    <ArrowLeft className="size-4" />
                                </div>
                                <div className="text-muted-foreground font-medium">Retour à l'accueil</div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}