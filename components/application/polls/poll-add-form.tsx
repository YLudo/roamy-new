"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PollSchema } from "@/schemas/polls";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface PollAddFormProps {
    travelId: string;
}

export default function PollAddForm({ travelId }: PollAddFormProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof PollSchema>>({
        resolver: zodResolver(PollSchema),
        defaultValues: {
            title: "",
            description: "",
            pollOptions: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "pollOptions",
    });

    const onSubmit = (values: z.infer<typeof PollSchema>) => {
        startTransition(async () => {
            try {
                const response = await fetch(`/api/travels/${travelId}/polls`, {
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

                toast.success("Sondage ajoutée !", { description: result.message });
                setOpen(false);
                form.reset();
            } catch (error: any) {
                toast.error("Oups ! ", { description: error.message || "Une erreur s'est produite lors de l'ajout du sondage." });
            }
        });
    }

    const addOption = () => {
        append({ text: "" });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nouveau sondage
                </Button>
            </DialogTrigger>
            <DialogContent className="!w-full !max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter un sondage</DialogTitle>
                    <DialogDescription>Créer un nouveau sondage pour votre voyage</DialogDescription>
                </DialogHeader>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informations de base</h3>
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titre</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Entrez le titre du sondage..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Entre la description du sondage..." rows={2} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Options du sondage</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addOption}
                                        className="h-8"
                                    >
                                        <Plus className="size-4 mr-2" />
                                        Ajouter une option
                                    </Button>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`pollOptions.${index}.text`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder={`Option ${index + 1}`} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {fields.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="size-10 text-destructive hover:text-destructive/90"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {form.formState.errors.pollOptions?.message && (
                                    <p className="text-sm font-medium text-destructive">
                                        {form.formState.errors.pollOptions?.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end py-4 border-t">
                                <Button type="submit">
                                    {isPending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin mr-2" />
                                            Chargement...
                                        </>
                                    ) : (
                                        "Créer le sondage"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}