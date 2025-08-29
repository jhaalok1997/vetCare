"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // for smooth animations

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AskVetAI() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // sidebar toggle
  const [userId, setUserId] = useState<string>("");

  // 🔑 Generate or load persistent userId
  useEffect(() => {
    let uid = localStorage.getItem("userId");
    if (!uid) {
      uid = crypto.randomUUID();
      localStorage.setItem("userId", uid);
    }
    setUserId(uid);

    // Load chat history if exists
    const storedHistory = localStorage.getItem("chatHistory");
    if (storedHistory) {
      setMessages(JSON.parse(storedHistory));
    }
  }, []);

  // 📝 Sync messages with localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // ❌ Clear chat when closed
  const handleClose = () => {
    setOpen(false);
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  // 🚀 Handle Ask
  const handleAsk = async () => {
    if (!question.trim() || !userId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/AskVetcare-button", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userId }),
      });

      const data = await res.json();

      if (data.history) {
        setMessages(data.history);
      } else if (data.answer) {
        // fallback
        setMessages((prev) => [
          ...prev,
          { role: "user", content: question },
          { role: "assistant", content: data.answer },
        ]);
      }

      setQuestion("");
    } catch (error) {
      console.error("❌ Error asking VetAI:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong." },
      ]);
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

      {/* Overlay for mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 sm:hidden z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                onClick={handleClose}
              >
                ✖
              </Button>
            </div>

            {/* Chat Body */}
            <div className="flex flex-col flex-grow overflow-y-auto p-4 gap-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-2xl shadow-sm max-w-[90%] ${
                    msg.role === "user"
                      ? "self-end bg-green-600 text-white"
                      : "self-start bg-green-50 border border-green-200 text-green-900"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
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
