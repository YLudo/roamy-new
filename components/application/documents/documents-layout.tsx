import DocumentsImportant from "./documents-important";
import DocumentsList from "./documents-list";
import DocumentsTotal from "./documents-total";

interface DocumentsLayoutProps {
    travel: ITravel;
}

export default function DocumentsLayout({ travel }: DocumentsLayoutProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentsTotal documents={travel.documents} />
                <DocumentsImportant documents={travel.documents} />
            </div>
            <div className="grid gap-4">
                <DocumentsList travel={travel} />
            </div>
        </div>
    );
}