import { POST } from "@/app/api/travels/[id]/polls/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: { findUnique: jest.fn() },
    poll: { create: jest.fn() },
}));
jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));

const prismaMock = prisma as unknown as {
    trip: { findUnique: jest.Mock };
    poll: { create: jest.Mock };
};
const pusherMock = pusherServer as unknown as { trigger: jest.Mock };

const mockSession = { user: { id: "u1" } };

const runPost = (params: { id: string }, body: any) =>
    POST(
        { json: async () => body } as Request,
        { params: Promise.resolve(params) }
    );

describe("POST /travels/[id]/polls", () => {
    beforeEach(() => jest.clearAllMocks());

    it("✅ crée un sondage si session valide et participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });
        prismaMock.poll.create.mockResolvedValue({ id: "poll1" });

        const res = (await runPost(
            { id: "t1" },
            {
                title: "Sondage",
                description: "Desc",
                pollOptions: [{ text: "Option A" }, { text: "Option B" }],
            }
        )) as NextResponse;
        const data = await res.json();

        expect(prismaMock.trip.findUnique).toHaveBeenCalledWith({
            where: { id: "t1" },
            include: { participants: true },
        });
        expect(prismaMock.poll.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "Sondage",
                    description: "Desc",
                    tripId: "t1",
                    userId: "u1",
                    pollOptions: {
                        createMany: {
                        data: [{ text: "Option A" }, { text: "Option B" }],
                        },
                    },
                }),
            })
        );
        expect(pusherMock.trigger).toHaveBeenCalledWith(
            "travel-t1",
            "polls:new",
            { id: "poll1" }
        );
        expect(res.status).toBe(201);
        expect(data.message).toMatch(/ajouté avec succès/i);
    });

    it("❌ retourne 401 si session expirée", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);
        const res = (await runPost(
            { id: "t1" },
            { title: "Test", pollOptions: [{ text: "A" }, { text: "B" }] }
        )) as NextResponse;
        expect(res.status).toBe(401);
    });

    it("❌ retourne 404 si voyage introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue(null);
        const res = (await runPost(
            { id: "t1" },
            { title: "Test", pollOptions: [{ text: "A" }, { text: "B" }] }
        )) as NextResponse;
        expect(res.status).toBe(404);
    });

    it("❌ retourne 403 si non participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "other" }],
        });
        const res = (await runPost(
            { id: "t1" },
            { title: "Test", pollOptions: [{ text: "A" }, { text: "B" }] }
        )) as NextResponse;
        expect(res.status).toBe(403);
    });

    it("❌ retourne 400 si données invalides", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });
        const res = (await runPost(
            { id: "t1" },
            { title: "T", pollOptions: [{ text: "" }] }
        )) as NextResponse;
        expect(res.status).toBe(400);
    });

    it("❌ retourne 500 si erreur interne", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockRejectedValue(new Error("DB fail"));
        const res = (await runPost(
            { id: "t1" },
            { title: "Test", pollOptions: [{ text: "A" }, { text: "B" }] }
        )) as NextResponse;
        expect(res.status).toBe(500);
    });
});
