"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import NavUser from "./nav-user";
import { useSession } from "next-auth/react";
import { getMenuList } from "@/lib/utils";
import { usePathname } from "next/navigation";
import NavMain from "./nav-main";
import TravelSwitcher from "./travel-switcher";
import { useTravelStore } from "@/stores/travel-store";

export default function AppSidebar() {
    const { data: session } = useSession();

    const { travels } = useTravelStore();

    const pathname = usePathname();
    const menuList = getMenuList(pathname);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <TravelSwitcher travels={travels} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={menuList} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={session?.user} />
            </SidebarFooter>
        </Sidebar>
    );
}