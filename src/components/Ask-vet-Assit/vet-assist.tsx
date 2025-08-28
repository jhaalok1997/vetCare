"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // for smooth animations

export default function AskVetAI() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false); // sidebar toggle

    const handleAsk = async () => {
        if (!question.trim()) return;
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
        <section className="relative">
            {/* Toggle Button */}
            <Button
                onClick={() => setOpen(!open)}
                className="text-green-700"
            >
                {open ? "Close Vet🐾Care Assistant" : "Ask Vet🐾Care Assistant"}
            </Button>

            {/* Overlay for mobile focus */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 sm:hidden z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar / Drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="chatbox"
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className={`
                            fixed z-50 bg-green-100 shadow-xl flex flex-col 
                            sm:inset-y-0 sm:left-0 sm:w-[80vw] md:max-w-md
                            w-full h-[80vh] bottom-0 left-0 sm:h-full
                            rounded-t-2xl sm:rounded-none
                        `}
                    >
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-green-200 rounded-t-2xl sm:rounded-none">
                            <h2 className="font-bold text-lg text-green-900">Ask Vet🐾Care</h2>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                            >
                                ✖
                            </Button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex flex-col flex-grow overflow-y-auto p-4 gap-3">
                            {answer && (
                                <div className="self-start bg-green-50 border border-green-200 text-green-900 px-3 py-2 rounded-2xl shadow-sm max-w-[90%]">
                                    {answer}
                                </div>
                            )}
                            {loading && (
                                <div className="self-start bg-gray-100 px-3 py-2 rounded-2xl text-gray-600 italic">
                                    Thinking...
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-white flex gap-2">
                            <textarea
                                className="flex-grow p-2 border rounded-md resize-none"
                                rows={2}
                                placeholder="Ask about veterinary problems..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <Button
                                onClick={handleAsk}
                                disabled={loading}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                Send
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
