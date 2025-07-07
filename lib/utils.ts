import { clsx, type ClassValue } from "clsx"
import { Euro, LayoutGrid, Map } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMenuList(pathname: string) {
  const match = pathname.match(/^\/travels\/([^\/]+)/);
  const travelBase = match ? `/travels/${match[1]}` : null;

  return [
    {
      href: travelBase,
      label: "Tableau de bord",
      icon: LayoutGrid,
      active: /^\/travels\/[^\/]+$/.test(pathname)
    },
    {
      href: `${travelBase}/activities`,
      label: "Activités",
      icon: Map,
      active: pathname.includes("/activities"),
    },
    {
      href: `${travelBase}/expenses`,
      label: "Dépenses",
      icon: Euro,
      active: pathname.includes("/expenses"),
    },
  ]
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export const expenseCategoryLabels: Record<string, string> = {
  accomodation: "Hébergement",
  transportation: "Transport",
  food: "Nourriture",
  drinks: "Boissons",
  activities: "Activités",
  shopping: "Shopping",
  other: "Autres",
};

export const activityTypeLabels: Record<string, string> = {
  transport: "Transport",
  accommodation: "Hébergement",
  restaurant: "Restaurant",
  sightseeing: "Tourisme",
  entertainment: "Divertissement",
  meeting: "Réunion",
  other: "Autre",
}

export const formatDate = (date?: Date) => {
  if (!date) return null
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
  }).format(new Date(date))
}

export const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
