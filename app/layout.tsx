import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Roamy",
    description: "Votre compagnon de voyage collaboratif"
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body
                className={cn(
                    "min-h-screen font-sans",
                    fontSans.variable
                )}
            >
                {children}
            </body>
        </html>
    );
}