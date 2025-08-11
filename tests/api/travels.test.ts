import { POST, GET } from "@/app/api/travels/route";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
    trip: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
}));

jest.mock("@/lib/pusher", () => ({
    pusherServer: { trigger: jest.fn() },
}));

const getServerSessionMock = getServerSession as jest.Mock;
const prismaMock = prisma as unknown as {
    trip: {
        create: jest.Mock;
        findMany: jest.Mock;
    };
};
const pusherMock = pusherServer.trigger as jest.Mock;

const makeRequest = (body?: any) =>
    new Request("http://localhost/api/travels", {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        headers: { "Content-Type": "application/json" },
    });

describe("/API /travels", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /travels", () => {
        it("❌ renvoie 401 si session invalide", async () => {
            getServerSessionMock.mockResolvedValue(null);

            const res = await POST(makeRequest());
            expect(res.status).toBe(401);

            const data = await res.json();
            expect(data.message).toMatch(/session a expiré/i);
        });

        it("❌ renvoie 400 si Zod échoue", async () => {
            getServerSessionMock.mockResolvedValue({ user: { id: "u1" } });

            const res = await POST(makeRequest({}));
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data.message).toMatch(/Veuillez vérifier les données/i);
        });

        it("✅ crée un voyage, ajoute le créateur comme participant, envoie pusher et renvoie 201", async () => {
            getServerSessionMock.mockResolvedValue({ user: { id: "u1" } });

            prismaMock.trip.create.mockResolvedValue({
                id: "t1",
                title: "Voyage test",
            } as any);

            const body = {
                title: "Voyage test",
                description: "Desc",
                destination_country: "France",
                destination_city: "Paris",
                start_date: "2025-08-10",
                end_date: "2025-08-15",
                visibility: "private",
            };

            const res = await POST(makeRequest(body));
            expect(res.status).toBe(201);

            expect(prismaMock.trip.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        title: "Voyage test",
                        createdBy: "u1",
                        participants: expect.objectContaining({
                            create: expect.objectContaining({
                                userId: "u1",
                                role: "owner",
                            }),
                        }),
                    }),
                })
            );

            expect(pusherMock).toHaveBeenCalledWith(
                "user-u1",
                "travels:new",
                expect.any(Object)
            );
        });

        it("❌ renvoie 500 si erreur interne", async () => {
            getServerSessionMock.mockResolvedValue({ user: { id: "u1" } });
            prismaMock.trip.create.mockRejectedValue(new Error("DB error"));

            const body = {
                title: "Voyage test",
                visibility: "private",
            };

            const res = await POST(makeRequest(body));
            expect(res.status).toBe(500);

            const data = await res.json();
            expect(data.message).toMatch(/Erreur lors de la création/i);
        });
    });

    describe("GET /travels", () => {
        const makeGetReq = () =>
        new Request("http://localhost/api/travels", { method: "GET" });

        it("❌ renvoie 401 si session invalide", async () => {
            getServerSessionMock.mockResolvedValue(null);

            const res = await GET(makeGetReq());
            expect(res.status).toBe(401);
        });

        it("✅ retourne la liste des voyages pour l'utilisateur", async () => {
            getServerSessionMock.mockResolvedValue({ user: { id: "u1" } });
            prismaMock.trip.findMany.mockResolvedValue([{ id: "t1", title: "Paris" }] as any);

            const res = await GET(makeGetReq());
            expect(res.status).toBe(200);

            expect(prismaMock.trip.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.any(Object),
                    include: expect.any(Object),
                    orderBy: { startDate: "desc" },
                })
            );

            const data = await res.json();
            expect(data).toEqual([{ id: "t1", title: "Paris" }]);
        });

        it("❌ renvoie 500 si erreur interne", async () => {
            getServerSessionMock.mockResolvedValue({ user: { id: "u1" } });
            prismaMock.trip.findMany.mockRejectedValue(new Error("DB error"));

            const res = await GET(makeGetReq());
            expect(res.status).toBe(500);

            const data = await res.json();
            expect(data.message).toMatch(/Erreur lors de la récupération/i);
        });
    });
});
