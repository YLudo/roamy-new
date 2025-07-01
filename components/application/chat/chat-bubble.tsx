"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pusherClient } from "@/lib/pusher";
import { useTravelStore } from "@/stores/travel-store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export default function ChatBubble() {
    const { currentTravel, setCurrentTravel } = useTravelStore();
    const { data: session } = useSession();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isSending, startTransition] = useTransition();

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    }, []);

    useEffect(() => {
        if (!currentTravel) return;

        if (isOpen && currentTravel.messages.length > 0) {
            const timeoutId = setTimeout(() => scrollToBottom("smooth"), 100)
            return () => clearTimeout(timeoutId)
        }
    }, [isOpen, scrollToBottom, currentTravel]);

    useEffect(() => {
        if (!currentTravel) return;

        const channelName = `travel-${currentTravel.id}`;
        const channel = pusherClient.subscribe(channelName);

        channel.bind("messages:new", (newMessage: IMessage) => {
            if (!currentTravel.messages.some(m => m.id === newMessage.id)) {
                setCurrentTravel({
                    ...currentTravel,
                    messages: [...currentTravel.messages, newMessage],
                });
            }

            if (isOpen) {
                setTimeout(() => scrollToBottom("smooth"), 100);
            }
        });

        return () => {
            pusherClient.unbind_all();
            pusherClient.unsubscribe(channelName);
        }
    })

    const sendMessage = () => {
        startTransition(async () => {
            if (!messageContent.trim() || !currentTravel) return;

            try {
                const response = await fetch(`/api/travels/${currentTravel.id}/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: messageContent }),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Une erreur inconnue s'est produite.");
                }

                setMessageContent("");
            } catch (error: any) {
                toast.error("Oups !", { description: error.message || "Une erreur s'est produite lors de l'envoi du message." });
            }
        });
    }

    const toggleChat = () => {
        setIsOpen(!isOpen);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isOpen && e.key === "Enter") {
            sendMessage()
        }
    }

    const messages = currentTravel?.messages ?? [];

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <Card className="w-80 sm:w-96 shadow-lg flex flex-col h-96 overflow-hidden p-0">
                    <div className="bg-primary text-primary-foreground flex p-4 items-center justify-between">
                        <CardTitle>Messagerie</CardTitle>
                        <Button variant="ghost" size="icon" onClick={toggleChat} className="size-8 text-primary-foreground">
                            <X className="size-4"/>
                            <span className="sr-only">Fermer</span>
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <p className="text-muted-foreground mb-2">Aucun message pour le moment</p>
                                <p className="text-sm text-muted-foreground">Soyez le premier à écrire !</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => {
                                    const isUserMessage = session?.user.id === message.senderId;
                                    const showDate =
                                        index === 0 ||
                                        new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();

                                    return (
                                        <div key={message.id} className="space-y-2">
                                            {showDate && (
                                                <div className="flex justify-center my-2">
                                                    <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                                                        {format(new Date(message.createdAt), "EEE d MMMM", { locale: fr })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}>
                                                <div 
                                                    className={
                                                        `min-w-[40%] max-w-[90%] rounded-2xl p-3 text-sm 
                                                        ${isUserMessage 
                                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                                            : "bg-muted rounded-bl-none"
                                                        }`
                                                    }
                                                >
                                                    {!isUserMessage && <p className="text-xs font-medium mb-1">{message.sender?.name}</p>}
                                                    <p className="break-words">{message.content}</p>
                                                    <p className="text-xs mt-1 opacity-70 text-right">
                                                        {format(new Date(message.createdAt), "HH:mm")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Écrivez votre message..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1"
                                disabled={isSending}
                            />
                            <Button
                                size="icon"
                                onClick={sendMessage}
                                disabled={!messageContent.trim() || isSending}
                            >
                                {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <Button size="icon" onClick={toggleChat} className="size-14 rounded-full shadow-lg">
                    <MessageCircle className="size-6" />
                    <span className="sr-only">Ouvrir le chat</span>
                </Button>
            )}
        </div>
    );
}