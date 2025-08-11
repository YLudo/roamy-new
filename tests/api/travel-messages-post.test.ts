import { POST } from "@/app/api/travels/[id]/messages/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: { findUnique: jest.fn() },
    message: { create: jest.fn() },
}));
jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));

const prismaMock = prisma as unknown as {
    trip: { findUnique: jest.Mock };
    message: { create: jest.Mock };
};
const pusherMock = pusherServer as unknown as { trigger: jest.Mock };

const mockSession = { user: { id: "u1" } };

const runPost = (params: { id: string }, body: any) =>
    POST(
        { json: async () => body } as Request,
        { params: Promise.resolve(params) }
    );

describe("POST /travels/[id]/messages", () => {
    beforeEach(() => jest.clearAllMocks());

    it("✅ envoie un message si session valide & participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });
        prismaMock.message.create.mockResolvedValue({
            id: "m1",
            content: "hello",
            tripId: "t1",
            senderId: "u1",
        });

        const res = (await runPost({ id: "t1" }, { content: "hello" })) as NextResponse;
        const data = await res.json();

        expect(prismaMock.trip.findUnique).toHaveBeenCalledWith({
            where: { id: "t1" },
            include: { participants: true },
        });
        expect(prismaMock.message.create).toHaveBeenCalledWith({
            data: { content: "hello", tripId: "t1", senderId: "u1" },
            include: { sender: true },
        });
        expect(pusherMock.trigger).toHaveBeenCalledWith(
            "travel-t1",
            "messages:new",
            expect.objectContaining({ id: "m1", content: "hello" })
        );
        expect(res.status).toBe(201);
        expect(data.message).toMatch(/envoyé avec succès/i);
    });

    it("❌ 401 si session expirée", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const res = (await runPost({ id: "t1" }, { content: "hello" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.message).toMatch(/session a expiré/i);
    });

    it("❌ 404 si voyage introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue(null);

        const res = (await runPost({ id: "t1" }, { content: "hello" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.message).toMatch(/n'existe pas/i);
    });

    it("❌ 403 si non participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "other" }],
        });

        const res = (await runPost({ id: "t1" }, { content: "hello" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.message).toMatch(/pas l'autorisation/i);
    });

    it("❌ 400 si contenu invalide", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });

        const res = (await runPost({ id: "t1" }, { content: "" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toMatch(/message valide/i);
    });

    it("❌ 500 si erreur interne", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockRejectedValue(new Error("DB down"));

        const res = (await runPost({ id: "t1" }, { content: "hello" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.message).toMatch(/Erreur lors de la récupération des messages/i);
    });
});
