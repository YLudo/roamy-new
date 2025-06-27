import { clsx, type ClassValue } from "clsx"
import { LayoutGrid } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMenuList(pathname: string) {
  return [
    {
      href: "/",
      label: "Tableau de bord",
      icon: LayoutGrid,
      active: /^\/travels\/[^\/]+$/.test(pathname)
    }
  ]
}
