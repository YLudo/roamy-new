import { POST } from "@/app/api/travels/[id]/expenses/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: { findUnique: jest.fn() },
    expense: { create: jest.fn() },
}));
jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));

const prismaMock = prisma as unknown as {
    trip: { findUnique: jest.Mock };
    expense: { create: jest.Mock };
};
const pusherMock = pusherServer as unknown as { trigger: jest.Mock };

const mockSession = { user: { id: "u1" } };

const runPost = (params: { id: string }, body: any) =>
    POST(
        { json: async () => body } as Request,
        { params: Promise.resolve(params) }
    );

describe("POST /travels/[id]/expenses", () => {
    beforeEach(() => jest.clearAllMocks());

    it("✅ ajoute une dépense (201) quand session valide & participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }, { userId: "u2" }],
            title: "Voyage Test",
        });

        prismaMock.expense.create.mockResolvedValue({
            id: "e1",
            title: "Essence",
            amount: 80.5,
            currency: "EUR",
            tripId: "t1",
            participants: [
                { userId: "u1", amountOwed: 50.5, user: { id: "u1" } },
                { userId: "u2", amountOwed: 30.0, user: { id: "u2" } },
            ],
            payer: { id: "u1" },
        });

        const body = {
            title: "Essence",
            description: "Trajet A→B",
            amount: "80.50",
            category: "transportation",
            paidBy: "u1",
            location: "Aire d'autoroute",
            expenseDate: "2025-08-12T09:00:00Z",
            isShared: true,
            participants: ["u1", "u2"],
            participantAmounts: { u1: "50.50", u2: "30.00" },
        };

        const res = (await runPost({ id: "t1" }, body)) as NextResponse;
        const data = await res.json();

        expect(prismaMock.expense.create).toHaveBeenCalledWith({
            data: {
                title: "Essence",
                description: "Trajet A→B",
                amount: 80.5,
                category: "transportation",
                currency: "EUR",
                paidBy: "u1",
                location: "Aire d'autoroute",
                expenseDate: new Date("2025-08-12T09:00:00Z"),
                isShared: true,
                tripId: "t1",
                participants: {
                    create: [
                        { userId: "u1", amountOwed: 50.5 },
                        { userId: "u2", amountOwed: 30.0 },
                    ],
                },
            },
            include: {
                participants: { include: { user: true } },
                payer: true,
            },
        });

        expect(pusherMock.trigger).toHaveBeenCalledWith(
            "travel-t1",
            "expenses:new",
            expect.objectContaining({ id: "e1", title: "Essence" })
        );

        expect(res.status).toBe(201);
        expect(data.message).toMatch(/ajouté avec succès/i);
    });

    it("❌ 401 si session expirée", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const res = (await runPost({ id: "t1" }, { title: "x" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.message).toMatch(/session a expiré/i);
    });

    it("❌ 404 si voyage introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue(null);

        const res = (await runPost({ id: "t1" }, { title: "x" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.message).toMatch(/n'existe pas/i);
    });

    it("❌ 403 si l'utilisateur n'est pas participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "other" }],
        });

        const res = (await runPost({ id: "t1" }, { title: "x" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.message).toMatch(/pas l'autorisation.*dépense/i);
    });

    it("❌ 400 si le schéma Expense est invalide", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });

        const res = (await runPost(
            { id: "t1" },
            {
                title: "Essence",
                amount: "",
                category: "transportation",
                paidBy: "u1",
                expenseDate: "2025-08-12T09:00:00Z",
                isShared: true,
                participants: ["u1"],
                participantAmounts: { u1: "10" },
            }
        )) as NextResponse;

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data.message).toMatch(/Veuillez vérifier les données/i);
        expect(prismaMock.expense.create).not.toHaveBeenCalled();
    });
});
