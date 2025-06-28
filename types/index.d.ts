interface IUser {
    id: string;
    name: string;
    email: string;
    image?: string;
}

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

    participants: IParticipant[];
}

interface IParticipant {
    id: string;
    tripId: string;
    userId: string;
    role: "owner" | "admin" | "member" | "viewer";
    status: "invited" | "accepted" | "declined" | "removed";
    invitedBy?: string | null;
    joinedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    user: IUser;
    inviter?: IUser | null;
}