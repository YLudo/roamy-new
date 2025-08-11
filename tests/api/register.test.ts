import { NextResponse } from "next/server";

jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        activateToken: {
            create: jest.fn(),
        },
    },
}));
const prismaMock = require("@/lib/prisma").default;

jest.mock("bcryptjs", () => ({
    hash: jest.fn(async (pw: string, salt: number) => `hashed:${pw}:${salt}`),
}));
const hashMock = require("bcryptjs").hash;

jest.mock("crypto", () => ({
    randomUUID: jest.fn(() => "uuid123"),
}));
const uuidMock = require("crypto").randomUUID;

const messagesCreateMock = jest.fn();
const mailgunClientFnMock = jest.fn(() => ({
    messages: { create: messagesCreateMock },
}));
jest.mock("mailgun.js", () => {
    return jest.fn().mockImplementation(() => ({
        client: mailgunClientFnMock,
    }));
});

import Mailgun from "mailgun.js";
const MailgunCtorMock = Mailgun as unknown as jest.Mock;

import { POST } from "@/app/api/auth/register/route";

describe("POST /register", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.MAILGUN_API_KEY = "test-key";
        process.env.MAILGUN_DOMAIN = "mg.example.com";
        process.env.NEXTAUTH_URL = "https://app.example.com";
    });

    it("✅ crée l'utilisateur, le token d'activation, envoie le mail et renvoie 201", async () => {
        prismaMock.user.findUnique
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        prismaMock.user.create.mockResolvedValueOnce({
            id: "u1",
            name: "alice",
            email: "a@ex.com",
        });
        prismaMock.activateToken.create.mockResolvedValueOnce({ token: "tok123" });

        const req = {
            json: async () => ({
                name: "alice",
                email: "a@ex.com",
                password: "P@ssw0rd!",
            }),
        } as Request;

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.message).toMatch(/Veuillez vérifier votre adresse e-mail/);

        expect(hashMock).toHaveBeenCalledWith("P@ssw0rd!", 10);
        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: "alice",
                email: "a@ex.com",
                password: "hashed:P@ssw0rd!:10",
            }),
        });
        expect(prismaMock.activateToken.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                token: expect.stringContaining("uuid123"),
                userId: "u1",
            }),
        });

        expect(MailgunCtorMock).toHaveBeenCalledTimes(1);
        expect(mailgunClientFnMock).toHaveBeenCalledWith({
            username: "api",
            key: "test-key",
        });
        expect(messagesCreateMock).toHaveBeenCalledWith(
            "mg.example.com",
            expect.objectContaining({
                to: "a@ex.com",
                template: expect.any(String),
            })
        );
    });

    it("❌ renvoie 400 si l'email est déjà pris", async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce({ id: "u1" });

        const req = {
            json: async () => ({
                name: "alice",
                email: "a@ex.com",
                password: "P@ssw0rd!",
            }),
        } as Request;

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/adresse e-mail.*déjà utilisée/);
        expect(prismaMock.user.create).not.toHaveBeenCalled();
        expect(messagesCreateMock).not.toHaveBeenCalled();
    });

    it("❌ renvoie 400 si le username est déjà pris", async () => {
        prismaMock.user.findUnique
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ id: "u1" });

        const req = {
            json: async () => ({
                name: "alice",
                email: "a@ex.com",
                password: "P@ssw0rd!",
            }),
        } as Request;

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/nom d'utilisateur.*déjà utilisé/);
        expect(prismaMock.user.create).not.toHaveBeenCalled();
        expect(messagesCreateMock).not.toHaveBeenCalled();
    });

    it("💥 renvoie 500 si une erreur interne se produit", async () => {
        prismaMock.user.findUnique.mockRejectedValueOnce(new Error("DB fail"));

        const req = {
            json: async () => ({
                name: "alice",
                email: "a@ex.com",
                password: "P@ssw0rd!",
            }),
        } as Request;

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toMatch(/Erreur interne/);
    });
});
