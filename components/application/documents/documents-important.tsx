import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface DocumentsImportantProps {
    documents: IDocument[];
}

export default function DocumentsImportant({ documents }: DocumentsImportantProps) {
    const importantDocuments = documents.filter((documents) => documents.isImportant);

    return (
        <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Documents importants</CardTitle>
                <CalendarDays className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{importantDocuments.length}</div>
            </CardContent>
        </Card>
    );
}