"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTravelStore } from "@/stores/travel-store";
import { Folder } from "lucide-react";
import { useState } from "react";
import DocumentAddForm from "./document-add-form";

interface DocumentsListProps {
    travel: ITravel;
}

export default function DocumentsList({ travel }: DocumentsListProps) {
    const { setCurrentTravel } = useTravelStore();

    const [searchTerm, setSearchTerm] = useState("");

    const filteredDocuments = travel.documents.filter((document) => {
        const matchesSearch =
            document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            document.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>Liste des documents</CardTitle>
                        <CardDescription>Gérez et filtrez vos documents</CardDescription>
                    </div>
                    <DocumentAddForm travelId={travel.id} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {filteredDocuments.length > 0 ? (
                    <div className="space-y-4">
                        {filteredDocuments.map((document) => (
                            <p key={document.id}>{document.title}</p>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 px-6 bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                        <div className="flex flex-col items-center space-y-2">
                            <Folder className="size-8 text-primary" />
                            <div className="space-y-2">
                                <h3 className="text font-semibold text-foreground">Aucun document enregistré</h3>
                                <p className="text-sm text-muted-foreground">Ajoutez un premier document pour commencer l'aventure.</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}