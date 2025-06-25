import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TravelSchema } from "@/schemas/travels";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const steps = ["Détails", "Destination", "Dates", "Visibilité"];

export default function CreateTripStepper() {
    const [step, setStep] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof TravelSchema>>({
        resolver: zodResolver(TravelSchema),
        defaultValues: {
            title: "",
            description: "",
            destination_country: "",
            destination_city: "",
            start_date: undefined,
            end_date: undefined,
            visibility: "participants_only",
        },
    });

    const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const back = () => setStep((s) => Math.max(s - 1, 0));

    const onSubmit = (values: z.infer<typeof TravelSchema>) => {
        startTransition(async () => {
            try {
                const response = await fetch("/api/travels", {
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

                toast.success("Connexion réussie !", { description: result.message });
                setOpen(false);
                form.reset();
                setStep(0);
            } catch (error: any) {
                toast.error("Connexion échouée !", { description: error.message || "Une erreur s'est produite lors de la connexion." });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mt-4">
                    <Plus className="size-4" />
                    Créer un voyage
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Créer un voyage</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                {steps.map((stepName, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                "flex items-center justify-center size-10 rounded-full border-2 transition-all duration-200",
                                                index < step
                                                    ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20"
                                                    : index === step
                                                        ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20"
                                                        : "bg-background border-muted-foreground/30 text-muted-foreground",
                                            )}
                                        >
                                            {index < step ? (
                                                <Check className="size-5" />
                                            ) : (
                                                <span className="text-sm font-medium">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p
                                                className={cn(
                                                    "text-sm font-medium transition-colors duration-200",
                                                    index <= step ? "text-foreground" : "text-muted-foreground",
                                                )}
                                            >
                                                {stepName}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="py-6">
                            {step === 0 && (
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titre</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Entrez un titre..." {...field} />
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
                                                    <Textarea placeholder="Entrez une description..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            {step === 1 && (
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="destination_country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pays de destination</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Entrez un pays de destination..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="destination_city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ville de destination</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Entrez une ville de destination..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            {step === 2 && (
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="start_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de début</FormLabel>
                                                <FormControl>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className="w-full justify-start text-left">
                                                                {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir une date de début"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={fr} />
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="end_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de fin</FormLabel>
                                                <FormControl>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className="w-full justify-start text-left">
                                                                {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir une date de fin"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={fr} />
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            {step === 3 && (
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="visibility"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visibilité</FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <RadioGroupItem value="private" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Privé</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <RadioGroupItem value="participants_only" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Participants seulement</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <RadioGroupItem value="public" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">Public</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-6 border-t">
                            <Button type="button" variant="ghost" onClick={back} disabled={step === 0} className="min-w-[100px]">
                                Précédent
                            </Button>
                            {step === steps.length - 1 ? (
                                <Button type="submit" disabled={isPending} className="min-w-[100px]">
                                   {isPending 
                                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        : "Créer le voyage"
                                    }
                                </Button>
                            ) : (
                                <Button 
                                    type="button" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        next();
                                    }} 
                                    className="min-w-[100px]">
                                    Suivant
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}