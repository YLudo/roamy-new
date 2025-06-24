"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        startTransition(async () => {
            const { email, password } = values;

            try {
                const response = await signIn("credentials", {
                    email, password, redirect: false
                });

                if (response?.error) {
                    throw new Error(response.error);
                }

                toast.success("Connexion réussie !", { description: "Vous vous êtes connecté avec succès." });
                router.push("/");
            } catch (error: any) {
                toast.error("Connexion échouée !", { description: error.message || "Une erreur s'est produite lors de la connexion." });
            }
        });
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Content de te revoir</CardTitle>
                    <CardDescription>
                        Connectez-vous avec votre compte Google
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="flex flex-col gap-4">
                            <Button variant="outline" className="w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                    />
                                </svg>
                                Connectez-vous avec Google
                            </Button>
                        </div>
                        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                            <span className="bg-card text-muted-foreground relative z-10 px-2">
                                Ou continuez avec
                            </span>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Adresse e-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Entrez votre adresse e-mail" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mot de passe</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Entrez votre mot de passe" {...field} />         
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={isPending} type="submit" className="w-full">
                                    {isPending 
                                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        : "Se connecter"
                                    }
                                </Button>
                            </form>
                        </Form>
                        <div className="text-center text-sm">
                            Vous n'avez pas de compte ?{" "}
                            <Link href="/register" className="underline underline-offset-4">
                                Inscrivez-vous
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                En cliquant sur « Continuer », vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
            </div>
        </div>
    );
}