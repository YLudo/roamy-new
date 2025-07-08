"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import NavUser from "./nav-user";
import { useSession } from "next-auth/react";
import { getGeneralMenuList, getTravelMenuList } from "@/lib/utils";
import { usePathname } from "next/navigation";
import NavMain from "./nav-main";
import TravelSwitcher from "./travel-switcher";
import { useTravelStore } from "@/stores/travel-store";
import NavTravel from "./nav-travel";

export default function AppSidebar() {
    const { data: session } = useSession();

    const { travels } = useTravelStore();

    const pathname = usePathname();
    const generalMenuList = getGeneralMenuList(pathname);
    const travelMenuList = getTravelMenuList(pathname);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <TravelSwitcher travels={travels} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={generalMenuList} />
                <NavTravel items={travelMenuList} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={session?.user} />
            </SidebarFooter>
        </Sidebar>
    );
}