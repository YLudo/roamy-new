"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragEndEvent, KanbanBoard, KanbanCard, KanbanCards, KanbanHeader, KanbanProvider } from "@/components/ui/shadcn-io/kanban";
import { pusherClient } from "@/lib/pusher";
import { useTravelStore } from "@/stores/travel-store";
import { useEffect } from "react";
import TaskAddForm from "./task-add-form";
import { toast } from "sonner";

interface TasksLayoutProps {
    travel: ITravel;
}

const tasksStatus = [
    { id: "1", name: "TODO", label: "A faire", color: '#6B7280' },
    { id: "2", name: "DOING", label: "En cours", color: '#F59E0B' },
    { id: "3", name: "DONE", label: "Terminé", color: '#10B981' },
];

export default function TasksLayout({ travel }: TasksLayoutProps) {
    const { setCurrentTravel } = useTravelStore();

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) return;

        const taskId = active.id;
        const newStatus = over.id.toString() as "TODO" | "DOING" | "DONE";

        const currentTask = travel.tasks.find((task) => task.id === taskId);
        if (!currentTask || currentTask.status === newStatus) return;

        try {
            const response = await fetch(`/api/travels/${travel.id}/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Une erreur inconnue s'est produite.");
            }

            setCurrentTravel({
                ...travel,
                tasks: travel.tasks.map((task) =>
                    task.id === active.id ? { ...task, status: newStatus } : task
                ),
            });
        } catch (error: any) {
            toast.error("Oups !", { description: error.message || "Une erreur s'est produite lors de la modification de la tâche." });
        }
    };

    useEffect(() => {
        if (!travel) return;

        const channel = pusherClient.subscribe(`travel-${travel.id}`);

        channel.bind("tasks:new", (newTask: ITask) => {
            if (!travel?.tasks.some(t => t.id === newTask.id)) {
                setCurrentTravel({
                    ...travel,
                    tasks: [...(travel?.tasks ?? []), newTask],
                });
            }
        });

        channel.bind("tasks:update", (updatedTask: ITask) => {
            const current = structuredClone(travel);

            const updatedTasks = current.tasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            );

            setCurrentTravel({ ...current, tasks: updatedTasks });
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(`travel-${travel.id}`);
        };
    }, [setCurrentTravel, travel]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Liste des tâches</CardTitle>
                    <TaskAddForm travelId={travel.id} />
                </div>
            </CardHeader>
            <CardContent>
                <KanbanProvider onDragEnd={handleDragEnd}>
                    {tasksStatus.map((status) => (
                        <KanbanBoard key={status.name} id={status.name}>
                            <KanbanHeader name={status.label} color={status.color} />
                            <KanbanCards>
                                {travel.tasks
                                    .filter((task) => task.status === status.name)
                                    .map((task, index) => (
                                        <KanbanCard
                                            key={task.id}
                                            id={task.id}
                                            name={task.title}
                                            index={index}
                                            parent={task.status}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <p className="m-0 flex-1 font-medium text-sm">{task.title}</p>
                                                {task.description && (
                                                    <p className="m-0 text-muted-foreground text-xs">{task.description}</p>
                                                )}
                                            </div>
                                        </KanbanCard>
                                    ))
                                }
                            </KanbanCards>
                        </KanbanBoard>
                    ))}
                </KanbanProvider>
            </CardContent>
        </Card>
    );
}