"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn, expenseCategoryLabels, formatCurrency } from "@/lib/utils";
import { ExpenseSchema } from "@/schemas/expenses";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Euro, Plus, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ExpenseAddFormProps {
    travel: ITravel;
}

export default function ExpenseAddForm({ travel }: ExpenseAddFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [participantAmounts, setParticipantAmounts] = useState<Record<string, string>>({});

    const form = useForm<z.infer<typeof ExpenseSchema>>({
        resolver: zodResolver(ExpenseSchema),
        defaultValues: {
            title: "",
            description: "",
            amount: "",
            category: "other",
            paidBy: "",
            location: "",
            expenseDate: undefined,
            isShared: false,
            participants: [],
            participantAmounts: {},
        },
    });

    const watchedAmount = form.watch("amount");
    const watchedPaidBy = form.watch("paidBy");
    const watchedIsShared = form.watch("isShared");
    const watchedParticipants = form.watch("participants");
    
    const onSubmit = (values: z.infer<typeof ExpenseSchema>) => {
        startTransition(async () => {
            try {
                const response = await fetch(`/api/travels/${travel.id}/expenses`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Une erreur inconnue s'est produite.");
                }

                toast.success("Dépense ajoutée !", { description: result.message });
                setOpen(false);
                form.reset();
            } catch (error: any) {
                toast.error("Oups !", { description: error.message || "Une erreur s'est produite lors de l'ajout de la dépense." });
            }
        })
    }

    const toggleParticipant = (userId: string) => {
        const currentParticipants = form.getValues("participants");
        const currentAmounts = form.getValues("participantAmounts");

        if (currentParticipants.includes(userId)) {
            const newParticipants = currentParticipants.filter((id) => id !== userId);
            const newAmounts = { ...currentAmounts };
            delete newAmounts[userId];

            form.setValue("participants", newParticipants);
            form.setValue("participantAmounts", newAmounts);
            setParticipantAmounts(newAmounts);
        } else {
            const totalAmount = Number.parseFloat(watchedAmount) || 0;
            const newParticipants = [...currentParticipants, userId];
            const amountPerPerson = totalAmount / (newParticipants.length + 1);

            const newAmounts = {
                ...currentAmounts,
                [userId]: amountPerPerson.toFixed(2),
            }

            form.setValue("participants", newParticipants);
            form.setValue("participantAmounts", newAmounts);
            setParticipantAmounts(newAmounts);
        }
    }

    const handleEqualSplit = () => {
        const totalAmount = Number.parseFloat(watchedAmount) || 0;
        const availableUsers = travel.participants.filter((participant) => participant.userId !== watchedPaidBy);
        const totalParticipants = availableUsers.length + 1;
        const amountPerPerson = totalAmount / totalParticipants;

        const newAmounts = availableUsers.reduce(
            (acc, participant) => ({
                ...acc,
                [participant.userId]: amountPerPerson.toFixed(2),
            }),
            {},
        );

        form.setValue(
            "participants",
            availableUsers.map((participant) => participant.userId),
        );
        form.setValue("participantAmounts", newAmounts);
        setParticipantAmounts(newAmounts);
    }

    const updateParticipantAmount = (userId: string, amount: string) => {
        const currentAmounts = form.getValues("participantAmounts");
        const newAmounts = {
            ...currentAmounts,
            [userId]: amount,
        }

        form.setValue("participantAmounts", newAmounts);
        setParticipantAmounts(newAmounts);
    }

    const totalAmount = Number.parseFloat(watchedAmount) || 0;
    const participantTotal = Object.values(participantAmounts).reduce(
        (sum, amount) => sum + (Number.parseFloat(amount) || 0),
        0,
    );
    const remainingAmount = totalAmount - participantTotal;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nouvelle dépense
                </Button>
            </DialogTrigger>
            <DialogContent className="!w-full !max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter une dépense</DialogTitle>
                    <DialogDescription>Créer une nouvelle dépense pour votre voyage</DialogDescription>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informations de base</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titre</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Entrez le titre de la dépense..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Montant</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                                                        <Input type="number" step="0.01" placeholder="0.00" className="pl-10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Entre la description de la dépense..." rows={2} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Détails</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Catégorie</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Catégorie" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="paidBy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payé par</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Payeur" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {travel.participants?.map((participant) => (
                                                            <SelectItem key={participant.userId} value={participant.userId}>
                                                                {participant.user?.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lieu</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Entrez le lieu de la dépense..." className="w-full" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expenseDate"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date de la dépense</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Sélectionner une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="isShared"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Partage de la dépense</FormLabel>
                                                    <FormDescription>Cette dépense est-elle partagée ?</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    {watchedIsShared && (
                                        <div className="space-y-4 p-4 border rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-sm font-medium">Participants et montants</FormLabel>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleEqualSplit}
                                                    disabled={!watchedAmount || !watchedPaidBy}
                                                >
                                                    Partage équitable
                                                </Button>
                                            </div>
                                            {watchedAmount && (
                                                <div className="text-sm text-muted-foreground mb-3">
                                                    <div className="flex justify-between">
                                                        <span>Montant total :</span>
                                                        <span className="font-medium">{formatCurrency(totalAmount, "EUR")}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Montant réparti :</span>
                                                        <span className="font-medium">{formatCurrency(participantTotal, "EUR")}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Reste à répartir :</span>
                                                        <span className={`font-medium ${remainingAmount < 0 ? "text-red-600" : "text-green-600"}`}>
                                                            {formatCurrency(remainingAmount, "EUR")}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                                {travel.participants
                                                    .filter((participant) => participant.userId !== watchedPaidBy)
                                                    .map((participant) => (
                                                        <div key={participant.userId} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        checked={watchedParticipants.includes(participant.userId)}
                                                                        onCheckedChange={() => toggleParticipant(participant.userId)}
                                                                        className="rounded"
                                                                    />
                                                                    <span className="text-sm font-medium">{participant.user.name}</span>
                                                                </div>
                                                            </div>
                                                            {watchedParticipants.includes(participant.userId) && (
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        value={participantAmounts[participant.userId] || ""}
                                                                        onChange={(e) => updateParticipantAmount(participant.userId, e.target.value)}
                                                                        className="w-24 text-right"
                                                                    />
                                                                    <span className="text-sm text-muted-foreground">EUR</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                ))}
                                            </div>
                                            {watchedParticipants.length > 0 && (
                                                <div className="pt-3 border-t">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="size-4" />
                                                            {watchedParticipants.length + 1} participant(s) au total
                                                        </span>
                                                        <span className="text-muted-foreground">Part du payeur : {formatCurrency(remainingAmount, "EUR")}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <FormField
                                                control={form.control}
                                                name="participantAmounts"
                                                render={() => (
                                                    <FormItem>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end py-4 border-t">
                                <Button type="submit">Créer la dépense</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}