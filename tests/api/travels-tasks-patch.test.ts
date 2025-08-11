import { PATCH } from "@/app/api/travels/[id]/tasks/[taskId]/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: { findUnique: jest.fn() },
    task: { update: jest.fn() },
}));
jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));

const prismaMock = prisma as unknown as {
    trip: { findUnique: jest.Mock };
    task: { update: jest.Mock };
};

const pusherMock = pusherServer as unknown as { trigger: jest.Mock };

const mockSession = { user: { id: "u1" } };
const runPatch = (params: { id: string; taskId: string }, body: any) =>
  PATCH(
    { json: async () => body } as Request,
    { params: Promise.resolve(params) }
  );

describe("PATCH /travels/[id]/tasks/[taskId]", () => {
    beforeEach(() => jest.clearAllMocks());

    it("✅ modifie la tâche si session valide et participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "u1" }],
        });
        prismaMock.task.update.mockResolvedValue({
            id: "task1",
            status: "done",
        });

        const res = (await runPatch({ id: "t1", taskId: "task1" }, { status: "done" })) as NextResponse;
        const data = await res.json();

        expect(prismaMock.trip.findUnique).toHaveBeenCalledWith({
            where: { id: "t1" },
            include: { participants: true },
        });
        expect(prismaMock.task.update).toHaveBeenCalledWith({
            where: { id: "task1" },
            data: { status: "done" },
        });
        expect(pusherMock.trigger).toHaveBeenCalledWith(
            "travel-t1",
            "tasks:update",
            { id: "task1", status: "done" }
        );
        expect(res.status).toBe(200);
        expect(data.message).toMatch(/modifiée avec succès/i);
    });

    it("❌ retourne 401 si session expirée", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const res = (await runPatch({ id: "t1", taskId: "task1" }, { status: "done" })) as NextResponse;
        expect(res.status).toBe(401);
    });

    it("❌ retourne 404 si voyage introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue(null);

        const res = (await runPatch({ id: "t1", taskId: "task1" }, { status: "done" })) as NextResponse;
        expect(res.status).toBe(404);
    });

    it("❌ retourne 403 si non participant", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "other" }],
        });

        const res = (await runPatch({ id: "t1", taskId: "task1" }, { status: "done" })) as NextResponse;
        expect(res.status).toBe(403);
    });

    it("❌ retourne 500 si erreur interne", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findUnique.mockRejectedValue(new Error("DB fail"));

        const res = (await runPatch({ id: "t1", taskId: "task1" }, { status: "done" })) as NextResponse;
        expect(res.status).toBe(500);
    });
});
