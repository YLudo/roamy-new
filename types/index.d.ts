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
    expenses: IExpense[];
    messages: IMessage[];
    activities: IActivity[];
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

interface IActivity {
    id: string;
    tripId: string;
    title: string;
    description?: string | null;
    type: ActivityType;
    startDate: Date;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    estimatedCost?: number | null;
    currency: string;
    isConfirmed: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;

    trip?: ITravel;
    creator?: IUser;
}

type ActivityType =
  | "all"
  | "transport" 
  | "accommodation" 
  | "restaurant" 
  | "sightseeing" 
  | "entertainment" 
  | "entertainment" 
  | "meeting" 
  | "other";

interface IExpense {
    id: string;
    tripId: string;
    category: ExpenseCategory;
    title: string;
    description?: string | null;
    amount: number;
    currency: string;
    expenseDate: Date;
    isShared: boolean;
    paidBy: string;
    location?: string | null;
    createdAt: Date;
    updatedAt: Date;

    trip?: ITravel;
    payer: IUser;
    participants?: IExpenseParticipant[];
}

interface IExpenseParticipant {
    id: string;
    expenseId: string;
    userId: string;
    amountOwed: number;
    isSettled: boolean;
    settledAt?: Date | null;

    expense?: IExpense;
    user?: IUser;
}

type ExpenseCategory =
  | "all"
  | "accommodation"
  | "transportation"
  | "food"
  | "drinks"
  | "activities"
  | "shopping"
  | "other";

type ExpenseStatus = "all" | "settled" | "pending";

interface IMessage {
    id: string;
    tripId: string;
    senderId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;

    trip?: ITravel;
    sender?: IUser;
}

interface MapboxFeature {
    id: string;
    place_name: string;
    center: [number, number];
}