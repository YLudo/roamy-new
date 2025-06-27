interface ITravel {
    id: string
    title: string
    description?: string
    destinationCity?: string
    destinationCountry?: string
    startDate?: Date
    endDate?: Date
    status: "planning" | "confirmed" | "ongoing" | "completed" | "cancelled"
    visibility: "participants_only" | "public" | "private"
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}