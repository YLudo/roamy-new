import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface DocumentsTotalProps {
    documents: IDocument[];
}

export default function DocumentsTotal({ documents }: DocumentsTotalProps) {
    return (
        <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Nombre de documents</CardTitle>
                <CalendarDays className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
        </Card>
    );
}