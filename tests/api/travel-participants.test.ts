import { POST } from "@/app/api/travels/[id]/participants/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import Mailgun from "mailgun.js";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: { findUnique: jest.fn() },
    tripParticipant: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    user: { findUnique: jest.fn() },
}));
jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));
jest.mock("mailgun.js", () => {
    return jest.fn().mockImplementation(() => ({
        client: jest.fn(() => ({
            messages: { create: jest.fn() },
        })),
    }));
});

const prismaMock = prisma as any;
const pusherMock = pusherServer as any;
const MailgunMock = Mailgun as unknown as jest.Mock;
const mockSession = { user: { id: "u1", name: "Inviter" } };

const runPost = async (body: any, params = { id: "trip1" }) =>
    POST(
        { json: async () => body } as Request,
        { params: Promise.resolve(params) }
    ) as Promise<NextResponse>;

describe("POST /travels/[id]/participants", () => {
    beforeEach(() => jest.clearAllMocks());

    it("✅ invite un participant avec succès", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            title: "Voyage Test",
            startDate: "2025-08-01",
            endDate: "2025-08-10",
            participants: [{ userId: "u1" }],
        });
        prismaMock.tripParticipant.findUnique
            .mockResolvedValueOnce({ userId: "u1", role: "owner" })
            .mockResolvedValueOnce(null);
        prismaMock.user.findUnique.mockResolvedValue({
            id: "u2",
            name: "Cible",
            email: "target@test.com",
        });
        prismaMock.tripParticipant.create.mockResolvedValue({ id: "tp1" });

        const mgInstance = { messages: { create: jest.fn() } };
            MailgunMock.mockImplementation(() => ({
            client: jest.fn(() => mgInstance),
        }));

        const res = await runPost({ email: "target@test.com" });
        const data = await res.json();

        expect(prismaMock.tripParticipant.create).toHaveBeenCalled();
        expect(pusherMock.trigger).toHaveBeenCalledTimes(2);
        expect(mgInstance.messages.create).toHaveBeenCalled();
        expect(res.status).toBe(201);
        expect(data.message).toMatch(/invité avec succès/i);
    });

    it("❌ retourne 401 si session expirée", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);
        const res = await runPost({ email: "test@test.com" });
        expect(res.status).toBe(401);
    });

    it("❌ retourne 404 si voyage introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue(null);
        const res = await runPost({ email: "test@test.com" });
        expect(res.status).toBe(404);
    });

    it("❌ retourne 403 si non participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ participants: [] });
        const res = await runPost({ email: "test@test.com" });
        expect(res.status).toBe(403);
    });

    it("❌ retourne 400 si email invalide", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ participants: [{ userId: "u1" }] });
        prismaMock.tripParticipant.findUnique.mockResolvedValue({ role: "owner" });
        const res = await runPost({ email: null });
        expect(res.status).toBe(400);
    });

    it("❌ retourne 403 si pas owner", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ participants: [{ userId: "u1" }] });
        prismaMock.tripParticipant.findUnique.mockResolvedValue({ role: "member" });
        const res = await runPost({ email: "test@test.com" });
        expect(res.status).toBe(403);
    });

    it("❌ retourne 404 si utilisateur introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ participants: [{ userId: "u1" }] });
        prismaMock.tripParticipant.findUnique.mockResolvedValueOnce({ role: "owner" });
        prismaMock.user.findUnique.mockResolvedValue(null);
        const res = await runPost({ email: "test@test.com" });
        expect(res.status).toBe(404);
    });

    it("❌ retourne 400 si déjà participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({ participants: [{ userId: "u1" }] });
        prismaMock.tripParticipant.findUnique
            .mockResolvedValueOnce({ role: "owner" })
            .mockResolvedValueOnce({ userId: "u2" });
        prismaMock.user.findUnique.mockResolvedValue({ id: "u2" });
        const res = await runPost({ email: "test@test.com" });
        expect(res.status).toBe(400);
    });

    it("❌ retourne 500 si erreur interne", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockRejectedValue(new Error("DB error"));
        const res = await runPost({ email: "test@test.com" });
        expect(res.status).toBe(500);
    });
});
