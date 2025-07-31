import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, MoreVertical, Plus } from "lucide-react";

interface BankTransactionsProps {
    transactions: any;
    isLoading: boolean;
}

export default function BankTransactions({ transactions, isLoading }: BankTransactionsProps) {
    if (isLoading) {
        return <Skeleton className="w-full h-[300px] rounded-xl" />
    }

    if (transactions.length <= 0) {
        return (
            <div className="lg:col-span-2 mt-4 h-fit text-center py-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">Aucune transactions disponible !</p>
            </div>
        );
    }

    console.log(transactions);

    return (
        <Table>
            <TableHeader className="bg-secondary">
                <TableRow>
                    <TableHead className="font-medium text-secondary-foreground">Transaction</TableHead>
                    <TableHead className="font-medium text-secondary-foreground">Montant</TableHead>
                    <TableHead className="font-medium text-secondary-foreground">Status</TableHead>
                    <TableHead className="font-medium text-secondary-foreground">Date</TableHead>
                    <TableHead className="font-medium text-secondary-foreground">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((transaction: any, index: number) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="max-w-[250px]">
                            <div className="font-medium truncate">{transaction.merchantName || transaction.name}</div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5">
                                {transaction.amount < 0 ? (
                                    <ArrowUpIcon className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                    <ArrowDownIcon className="w-3.5 h-3.5 text-red-500" />
                                )}
                                <span className={`font-medium ${transaction.amount < 0 ? "text-green-500" : "text-red-500"}`}>
                                    {formatCurrency(transaction.amount, "EUR")}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge
                                variant={transaction.pending ? "secondary" : "default"}
                                className={!transaction.pending ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                            >
                                {transaction.pending ? "En attente" : "Validé"}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(transaction.date)}</TableCell>
                        <TableCell className="flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <MoreVertical className="h-4 w-4 hover:cursor-pointer" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="hover:cursor-pointer">
                                        <Plus className="w-4 h-4 mr-3 text-muted-foreground" />
                                        Ajouter à un voyage
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}