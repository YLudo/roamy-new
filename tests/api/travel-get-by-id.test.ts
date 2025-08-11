import { GET } from "@/app/api/travels/[id]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth");
jest.mock("@/lib/prisma", () => ({
    trip: {
        findFirst: jest.fn(),
    },
}));

const prismaMock = prisma as unknown as {
    trip: {
        findFirst: jest.Mock;
    };
};

const mockSession = {
    user: { id: "u1", name: "Alice", email: "alice@example.com" },
};

async function runGet(params: { id: string }) {
    return GET({} as Request, { params: Promise.resolve(params) });
}

describe("GET /travels/[id]", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("✅ retourne le voyage si session valide et participant accepté", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        const fakeTravel = {
            id: "t1",
            participants: [{ userId: "u1", status: "accepted" }],
        };

        prismaMock.trip.findFirst.mockResolvedValue(fakeTravel);

        const res = (await runGet({ id: "t1" })) as NextResponse;
        const data = await res.json();

        expect(prismaMock.trip.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                id: "t1",
                participants: expect.any(Object),
                }),
            })
        );
        expect(res.status).toBe(200);
        expect(data).toEqual(fakeTravel);
    });

    it("❌ retourne 401 si session expirée", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const res = (await runGet({ id: "t1" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.message).toMatch(/session a expiré/i);
    });

    it("❌ retourne 404 si voyage introuvable", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findFirst.mockResolvedValue(null);

        const res = (await runGet({ id: "t1" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.message).toMatch(/n'existe pas/i);
    });

    it("❌ retourne 403 si utilisateur non participant accepté", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);

        prismaMock.trip.findFirst.mockResolvedValue({
            id: "t1",
            participants: [{ userId: "other", status: "accepted" }],
        });

        const res = (await runGet({ id: "t1" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.message).toMatch(/pas l'autorisation/i);
    });

    it("❌ retourne 500 si erreur Prisma", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        prismaMock.trip.findFirst.mockRejectedValue(new Error("DB fail"));

        const res = (await runGet({ id: "t1" })) as NextResponse;
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.message).toMatch(/erreur lors/i);
    });
});
