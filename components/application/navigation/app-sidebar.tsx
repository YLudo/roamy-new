"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import NavUser from "./nav-user";
import { useSession } from "next-auth/react";
import { getMenuList } from "@/lib/utils";
import { usePathname } from "next/navigation";
import NavMain from "./nav-main";
import TravelSwitcher from "./travel-switcher";

const data = {
    travels: [
        {
            title: "RoadTrip USA",
            destination_country: "USA",
            destination_city: "",
        },
        {
            title: "Monaco",
            destination_country: "",
            destination_city: "Monaco",
        }
    ]
}

export default function AppSidebar() {
    const { data: session } = useSession();

    const pathname = usePathname();
    const menuList = getMenuList(pathname);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <TravelSwitcher travels={data.travels} />
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