"use client";

import { useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function AskVetAI() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/AskVetcare-button", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });
            const data = await res.json();
            setAnswer(data.answer);
        } catch (error) {
            setAnswer("⚠️ Something went wrong.");
            console.error("Error asking VetAI:", error);
        }
        setLoading(false);
    };

    return (
        <section>
            <Drawer>
                <DrawerTrigger asChild>
                    <Button className="text-green-700">Ask Vet🐾Care Assistant</Button>
                </DrawerTrigger>

                {/* ✅ Drawer from left side, height = 50% of screen, scrollable */}
                <DrawerContent
                   // side="right"
                    className="h-[60vh] w-full sm:max-w-md flex flex-col bg-green-200 overflow-y-auto"
                >
                    <DrawerHeader>
                        <DrawerTitle>Ask Vet🐾Care</DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 flex flex-col gap-4 flex-grow overflow-y-auto">
                        <textarea
                            className="w-full p-3 border rounded-md"
                            rows={3}
                            placeholder="Ask about veterinary problems..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />

                        <Button
                            onClick={handleAsk}
                            disabled={loading}
                            className="bg-black text-white hover:bg-gray-500 transition"
                        >
                            {loading ? "Thinking..." : "Ask"}
                        </Button>

                        {answer && (
                            <div className="mt-4 p-3 border rounded-md bg-gray-50 overflow-y-auto max-h-[40vh]">
                                <p className="font-semibold text-blue-700">Vet-Assistant:</p>
                                <p className="text-sm">{answer}</p>
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </section>
    );
}
