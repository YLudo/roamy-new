import { PATCH } from "@/app/api/travels/[id]/invitations/route"; // ← ajuste le chemin exact
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: { findUnique: jest.fn() },
    tripParticipant: { findUnique: jest.fn(), update: jest.fn() },
}));
jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));

const prismaMock = prisma as unknown as {
    trip: { findUnique: jest.Mock };
    tripParticipant: { findUnique: jest.Mock; update: jest.Mock };
};
const pusherMock = pusherServer as unknown as { trigger: jest.Mock };

const mockSession = { user: { id: "u1" } };

const runPatch = (params: { id: string }, body: any) =>
    PATCH(
        { json: async () => body } as Request,
        { params: Promise.resolve(params) }
    );

describe("PATCH /travels/[id]/invitations", () => {
    beforeEach(() => jest.clearAllMocks());

    it("✅ accepte l'invitation (status=accepted)", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        prismaMock.trip.findUnique.mockResolvedValue({ id: "t1" });
        prismaMock.tripParticipant.findUnique.mockResolvedValue({
            id: "tp1",
            tripId: "t1",
            userId: "u1",
            status: "invited",
        });
        prismaMock.tripParticipant.update.mockResolvedValue({
            id: "tp1",
            status: "accepted",
            user: { name: "Alice", email: "alice@example.com" },
        });

        const res = (await runPatch({ id: "t1" }, { status: "accepted" })) as NextResponse;
        const data = await res.json();

        expect(prismaMock.trip.findUnique).toHaveBeenCalledWith({ where: { id: "t1" } });
        expect(prismaMock.tripParticipant.findUnique).toHaveBeenCalledWith({
            where: { tripId_userId: { tripId: "t1", userId: "u1" } },
        });
        expect(prismaMock.tripParticipant.update).toHaveBeenCalledWith({
            where: { id: "tp1" },
            data: { status: "accepted" },
            include: { user: { select: { name: true, email: true } } },
        });

        expect(pusherMock.trigger).toHaveBeenCalledWith(
            "travel-t1",
            "invitations:respond",
            expect.objectContaining({ status: "accepted" })
        );
        expect(pusherMock.trigger).toHaveBeenCalledWith(
            "user-u1",
            "invitations:respond",
            expect.objectContaining({ status: "accepted" })
        );

        expect(res.status).toBe(200);
        expect(data.message).toMatch(/accepté l'invitation/i);
    });

    it("✅ décline l'invitation (status=declined)", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        prismaMock.trip.findUnique.mockResolvedValue({ id: "t1" });
        prismaMock.tripParticipant.findUnique.mockResolvedValue({
            id: "tp1",
            tripId: "t1",
            userId: "u1",
            status: "invited",
        });
        prismaMock.tripParticipant.update.mockResolvedValue({
            id: "tp1",
            status: "declined",
            user: { name: "Alice", email: "alice@example.com" },
        });

        const res = (await runPatch({ id: "t1" }, { status: "declined" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.message).toMatch(/décliné l'invitation/i);
    });

    it("❌ 401 si session expirée", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const res = (await runPatch({ id: "t1" }, { status: "accepted" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.message).toMatch(/session a expiré/i);
    });

    it("❌ 404 si voyage introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue(null);

        const res = (await runPatch({ id: "t1" }, { status: "accepted" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.message).toMatch(/n'existe pas/i);
    });

    it("❌ 404 si participant introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ id: "t1" });
        prismaMock.tripParticipant.findUnique.mockResolvedValue(null);

        const res = (await runPatch({ id: "t1" }, { status: "accepted" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.message).toMatch(/invitation.*n'existe pas/i);
    });

    it("❌ 400 si participant pas 'invited'", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ id: "t1" });
        prismaMock.tripParticipant.findUnique.mockResolvedValue({
            id: "tp1",
            tripId: "t1",
            userId: "u1",
            status: "accepted",
        });

        const res = (await runPatch({ id: "t1" }, { status: "accepted" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toMatch(/déjà un participant/i);
    });

    it("❌ 400 si statut invalide", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ id: "t1" });
        prismaMock.tripParticipant.findUnique.mockResolvedValue({
            id: "tp1",
            tripId: "t1",
            userId: "u1",
            status: "invited",
        });

        const res = (await runPatch({ id: "t1" }, { status: "maybe" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.message).toMatch(/statut valide/i);
    });

    it("❌ 500 si erreur interne", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockRejectedValue(new Error("DB down"));

        const res = (await runPatch({ id: "t1" }, { status: "accepted" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.message).toMatch(/mise à jour de l'invitation/i);
    });
});
