"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { activityTypeLabels, cn } from "@/lib/utils";
import { ActivitySchema } from "@/schemas/activities";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Euro, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ActivityAddFormProps {
    travelId: string;
}

export default function ActivityAddForm({ travelId }: ActivityAddFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [time, setTime] = useState("00:00");
    const [locationQuery, setLocationQuery] = useState("");
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    
    const form = useForm<z.infer<typeof ActivitySchema>>({
        resolver: zodResolver(ActivitySchema),
        defaultValues: {
            title: "",
            description: "",
            type: "other",
            startDate: undefined,
            location: "",
            latitude: undefined,
            longitude: undefined,
            estimatedCost: "",
            isConfirmed: false,
        },
    });

    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&language=fr&country=FR`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            setSuggestions(data.features || []);
        } catch (error) {
            setSuggestions([]);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSuggestions(locationQuery);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [locationQuery, fetchSuggestions]);

    const onSubmit = (values: z.infer<typeof ActivitySchema>) => {
        startTransition(async () => {
            startTransition(async () => {
                try {
                    const response = await fetch(`/api/travels/${travelId}/activities`, {
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

                    toast.success("Activité ajoutée !", { description: result.message });
                    setOpen(false);
                    form.reset();
                } catch (error: any) {
                    toast.error("Oups !", { description: error.message || "Une erreur s'est produite lors de l'ajout de l'activité." });
                }
            })
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nouvelle activité
                </Button>
            </DialogTrigger>
            <DialogContent className="!w-full !max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Ajouter une activité</DialogTitle>
                    <DialogDescription>Créer une nouvelle activité pour votre voyage</DialogDescription>
                </DialogHeader>
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
                                                <Input placeholder="Entrez le titre de l'activité..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(activityTypeLabels).map(([value, label]) => (
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
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adresse</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input 
                                                    placeholder="Entrez l'adresse de l'activité..." 
                                                    {...field} 
                                                    value={locationQuery}
                                                    onChange={(e) => {
                                                        setLocationQuery(e.target.value);
                                                        field.onChange(e.target.value);
                                                    }}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                                />
                                                {suggestions.length > 0 && (
                                                    <ul className="absolute z-10 w-full bg-background border mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                        {suggestions.map((suggestion) => (
                                                            <li
                                                                key={suggestion.id}
                                                                className="px-3 py-2 cursor-pointer hover:bg-accent"
                                                                onClick={() => {
                                                                    const selectedAddress = suggestion.place_name;
                                                                    const [longitude, latitude] = suggestion.center;

                                                                    form.setValue('location', selectedAddress, { shouldValidate: true });
                                                                    form.setValue('latitude', latitude);
                                                                    form.setValue('longitude', longitude);

                                                                    setLocationQuery(selectedAddress);
                                                                    setSuggestions([]);
                                                                }}
                                                            >
                                                                {suggestion.place_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date et heure de début</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "flex-1 pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP 'à' HH:mm", { locale: fr })
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
                                                        onSelect={(date) => {
                                                            if (!date) return;
                                                            const [hours, minutes] = time.split(":").map(Number);
                                                            const newDateTime = new Date(date);
                                                            newDateTime.setHours(hours, minutes);
                                                            field.onChange(newDateTime);
                                                        }}
                                                        disabled={(date) => date < new Date("1900-01-01")}
                                                        locale={fr}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormControl>
                                                <Input
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => {
                                                    const newTime = e.target.value;
                                                    setTime(newTime);

                                                    if (field.value) {
                                                        const [hours, minutes] = newTime.split(":").map(Number);
                                                        const newDateTime = new Date(field.value);
                                                        newDateTime.setHours(hours, minutes);
                                                        field.onChange(newDateTime);
                                                    }
                                                    }}
                                                    className="w-auto"
                                                />
                                                </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="estimatedCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Montant estimé</FormLabel>
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
                                <FormField
                                    control={form.control}
                                    name="isConfirmed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>L'activité est-elle confirmé ?</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit">
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                        Chargement...
                                    </>
                                ) : (
                                    "Créer l'activité"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}