import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { expenseCategoryLabels, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Calendar, Check, Clock, CreditCard, MapPin, Users, X } from "lucide-react";

interface ExpenseDetailsProps {
    expense: IExpense;
    onClose: () => void;
}

export default function ExpenseDetails({
    expense,
    onClose
}: ExpenseDetailsProps) {
    const totalParticipants = expense.participants ? expense.participants.length + 1 : 1;
    const settledParticipants = expense.participants ? expense.participants.filter((p) => p.isSettled).length : 0;

    const settlementProgress =
        expense.participants && expense.participants.length > 0
            ? (settledParticipants / expense.participants.length) * 100
            : 0;

    const totalOwed = expense.participants ? expense.participants.reduce((sum, p) => sum + p.amountOwed, 0) : 0;

    const settledAmount = expense.participants
        ? expense.participants.filter((p) => p.isSettled).reduce((sum, p) => sum + p.amountOwed, 0)
        : 0;

    const pendingAmount = totalOwed - settledAmount

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-lg font-bold tracking-tight">{expense.title}</h2>
                                    {expense.isShared && (
                                        <Badge variant="secondary" className="text-xs">
                                            <Users className="size-3 mr-1" />
                                            Partagé
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                        {expenseCategoryLabels[expense.category]}
                                    </Badge>
                                </div>
                                <div className="text-xl font-bold text-primary">
                                    {formatCurrency(expense.amount, "EUR")}
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="size-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-medium">{formatDate(expense.expenseDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CreditCard className="size-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payé par</p>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="size-5">
                                            <AvatarFallback className="text-xs">{expense.payer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="font-medium">{expense.payer.name}</p>
                                    </div>
                                </div>
                            </div>
                            {expense.location && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lieu</p>
                                        <p className="font-medium truncate" title={expense.location}>
                                            {expense.location}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {expense.isShared && expense.participants && expense.participants.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Participants</p>
                                        <p className="font-medium">
                                            {settledParticipants}/{expense.participants.length} réglé(s)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {expense.description && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                                    <p className="text-sm leading-relaxed rounded-lg">{expense.description}</p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Résumé financier</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Montant total</span>
                                    <span className="font-semibold text-lg">{formatCurrency(expense.amount, expense.currency)}</span>
                                </div>

                                {expense.isShared && expense.participants && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Part par personne</span>
                                            <span className="font-medium">
                                                {formatCurrency(expense.amount / totalParticipants, expense.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-green-600">Montant réglé</span>
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(settledAmount, expense.currency)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-red-600">En attente</span>
                                            <span className="font-medium text-red-600">
                                                {formatCurrency(pendingAmount, expense.currency)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    {expense.isShared && expense.participants && expense.participants.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Progression</CardTitle>
                                <CardDescription>
                                    {settledParticipants}/{expense.participants.length} participant(s) ont réglé
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Progress value={settlementProgress} className="h-2" />
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>{settlementProgress.toFixed(0)}% réglé</span>
                                        <span>{expense.participants.length - settledParticipants} en attente</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {expense.isShared && expense.participants && expense.participants.length > 0 && (
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Partage de la dépense
                                        </CardTitle>
                                        <CardDescription>Détail des participants et de leurs contributions</CardDescription>
                                    </div>
                                    <Badge
                                        variant={settledParticipants === expense.participants.length ? "default" : "secondary"}
                                        className="text-xs"
                                    >
                                        {settledParticipants === expense.participants.length ? (
                                            <>
                                                <Check className="h-3 w-3 mr-1" />
                                                Entièrement réglé
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="h-3 w-3 mr-1" />
                                                En cours
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 ring-2 ring-green-200">
                                                <AvatarFallback className="text-sm bg-green-100">
                                                    {expense.payer.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="font-semibold">{expense.payer.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline" className="text-xs bg-green-100 border-green-300">
                                                        Payeur
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-700">
                                                +{formatCurrency(expense.amount - expense.amount / totalParticipants, expense.currency)}
                                            </p>
                                            <p className="text-xs text-green-600">À recevoir</p>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    {expense.participants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                                                participant.isSettled ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        className={`h-10 w-10 ring-2 ${participant.isSettled ? "ring-green-200" : "ring-red-200"}`}
                                                    >
                                                        <AvatarFallback
                                                            className={`text-sm ${participant.isSettled ? "bg-green-100" : "bg-red-100"}`}
                                                        >
                                                            {participant.user.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1">
                                                        <p className="font-semibold">{participant.user.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={participant.isSettled ? "default" : "secondary"}
                                                                className={`text-xs ${
                                                                participant.isSettled
                                                                    ? "bg-green-100 text-green-800 border-green-300"
                                                                    : "bg-red-100 text-red-800 border-red-300"
                                                                }`}
                                                            >
                                                                {participant.isSettled ? (
                                                                    <>
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Réglé
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <X className="h-3 w-3 mr-1" />
                                                                        En attente
                                                                    </>
                                                                )}
                                                            </Badge>
                                                            {participant.settledAt && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    le {formatDate(participant.settledAt)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-semibold ${participant.isSettled ? "text-green-700" : "text-red-700"}`}>
                                                        -{formatCurrency(participant.amountOwed, expense.currency)}
                                                    </p>
                                                    {!participant.isSettled && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                        >
                                                        <Check className="h-3 w-3 mr-1" />
                                                            Marquer comme réglé
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}