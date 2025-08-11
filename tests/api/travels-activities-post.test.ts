import { POST } from "@/app/api/travels/[id]/activities/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: { findUnique: jest.fn() },
    activity: { create: jest.fn() },
}));
jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));

const prismaMock = prisma as unknown as {
    trip: { findUnique: jest.Mock };
    activity: { create: jest.Mock };
};
const pusherMock = pusherServer as unknown as { trigger: jest.Mock };

const mockSession = { user: { id: "u1" } };

const runPost = (params: { id: string }, body: any) =>
    POST({ json: async () => body } as Request, { params: Promise.resolve(params) });

describe("POST /travels/[id]/activities", () => {
    beforeEach(() => jest.clearAllMocks());

    it("✅ crée une activité (201) quand session valide & participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });
        prismaMock.activity.create.mockResolvedValue({
            id: "a1",
            title: "Visite",
            type: "sightseeing",
        });

        const body = {
            title: "Visite",
            description: "Musée",
            type: "sightseeing",
            startDate: "2025-08-12T10:00:00Z",
            location: "Florence",
            latitude: 43.7687,
            longitude: 11.2556,
            estimatedCost: "19.9",
            isConfirmed: true,
        };

        const res = (await runPost({ id: "t1" }, body)) as NextResponse;
        const data = await res.json();

        expect(prismaMock.trip.findUnique).toHaveBeenCalledWith({
            where: { id: "t1" },
            include: { participants: true },
        });
        expect(prismaMock.activity.create).toHaveBeenCalledWith({
            data: {
                title: "Visite",
                description: "Musée",
                type: "sightseeing",
                startDate: new Date("2025-08-12T10:00:00Z"),
                location: "Florence",
                latitude: 43.7687,
                longitude: 11.2556,
                estimatedCost: 19.9,
                isConfirmed: true,
                tripId: "t1",
                createdBy: "u1",
            },
        });
        expect(pusherMock.trigger).toHaveBeenCalledWith(
            "travel-t1",
            "activities:new",
            expect.objectContaining({ id: "a1", title: "Visite" })
        );
        expect(res.status).toBe(201);
        expect(data.message).toMatch(/ajoutée avec succès/i);
    });

    it("✅ accepte estimatedCost vide → undefined", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });
        prismaMock.activity.create.mockResolvedValue({ id: "a2" });

        const res = (await runPost(
            { id: "t1" },
            {
                title: "Balade",
                type: "sightseeing",
                startDate: "2025-08-12T10:00:00Z",
                estimatedCost: "",
                isConfirmed: false,
            }
        )) as NextResponse;

        expect(prismaMock.activity.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                title: "Balade",
                estimatedCost: undefined,
            }),
        });
        expect(res.status).toBe(201);
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
        const res = (await runPost({ id: "t1" }, { title: "x", type: "sightseeing", startDate: "2025-01-01" })) as NextResponse;
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
        const res = (await runPost({ id: "t1" }, { title: "x", type: "sightseeing", startDate: "2025-01-01" })) as NextResponse;
        const data = await res.json();
        expect(res.status).toBe(403);
        expect(data.message).toMatch(/pas l'autorisation.*activité/i);
    });

    it("❌ 400 si schéma Activity invalide", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });
        const res = (await runPost(
            { id: "t1" },
            { title: "", type: "sightseeing", startDate: "2025-01-01" }
        )) as NextResponse;
        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data.message).toMatch(/Veuillez vérifier les données/i);
        expect(prismaMock.activity.create).not.toHaveBeenCalled();
    });

    it("❌ 500 si erreur interne (ex: Prisma lève)", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockRejectedValue(new Error("DB down"));
        const res = (await runPost(
            { id: "t1" },
            { title: "x", type: "sightseeing", startDate: "2025-01-01" }
        )) as NextResponse;
        const data = await res.json();
        expect(res.status).toBe(500);
        expect(data.message).toMatch(/Erreur interne du serveur.*activité/i);
    });
});
