import { z } from "zod";

export const ExpenseSchema = z.object({
    title: z
        .string()
        .min(1, {
            message: "Vous devez spécifier le titre de la dépense.",
        }),
    description: z
        .string()
        .optional(),
    amount: z
        .string()
        .min(1, {
            message: "Vous devez spécifier le montant de la dépense."
        })
        .refine(
            (val) => {
                const num = Number.parseFloat(val);
                return !isNaN(num) && num > 0;
            },
            {
                message: "Le montant de la dépense doit être un nombre positif.",
            },
        ),
    category: z
        .enum(
            ["accomodation", "transportation", "food", "drinks", "activities", "shopping", "other"],
            {
                message: "Vous devez spécifier une catégorie valide.",
            },
        ),
    paidBy: z
        .string()
        .min(1, {
            message: "Vous devez spécifier qui a payé la dépense.",
        }),
    location: z
        .string()
        .optional(),
    expenseDate: z
        .coerce
        .date({
            message: "Vous devez spécifier une date valide.",
        }),
    isShared: z
        .boolean(),
    participants: z
        .array(z.string()),
    participantAmounts: z
        .record(z.string(), z.string()),
}).refine(
    (data) => {
        if (!data.isShared) return true;

        const totalAmount = Number.parseFloat(data.amount);
        const participantTotal = Object.values(data.participantAmounts).reduce(
            (sum, amount) => sum + (Number.parseFloat(amount) || 0),
            0
        );

        return participantTotal <= totalAmount;
    },
    {
        message: "La somme des montants des participants ne peut pas dépasser le montant total.",
        path: ["participantAmounts"],
    },
);