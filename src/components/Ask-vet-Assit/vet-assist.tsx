"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AskVetAI() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // 🔑 Generate or load a unique userId once per browser
  useEffect(() => {
    let uid = localStorage.getItem("userId");
    if (!uid) {
      uid = crypto.randomUUID();
      localStorage.setItem("userId", uid);
    }
    setUserId(uid);
  }, []);

  // 🔄 Load chat history from Redis
  useEffect(() => {
    if (!userId) return;

    const fetchChatHistory = async () => {
      try {
        const res = await fetch("/api/getUserChatHistory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        if (data.history && Array.isArray(data.history)) {
          setMessages(data.history);
        }
      } catch (err) {
        console.error("⚠️ Failed to load chat history:", err);
      }
    };

    fetchChatHistory();
  }, [userId]);

  // ❌ Clear chat (local view only — Redis history remains)
  const handleClose = () => {
    setOpen(false);
    setMessages([]);
  };

  // 🚀 Send question to backend
  const handleAsk = async () => {
    if (!question.trim() || !userId || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/AskVetcare-button", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userId }),
      });

      const data = await res.json();

      if (data.history && Array.isArray(data.history)) {
        setMessages(data.history);
      } else if (data.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: question },
          { role: "assistant", content: data.answer },
        ]);
      }

      setQuestion("");
    } catch (error) {
      console.error(" Error asking VetAI:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            " Sorry for the trouble right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Scroll chat to bottom when messages change
  useEffect(() => {
    const chatBody = document.querySelector(".chat-scroll-container");
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }, [messages]);

  return (
    <section className="relative">
      {/* Toggle Chat Button */}
      <Button onClick={() => setOpen(!open)} className="text-white hover:bg-gray-700 cursor-pointer">
        {open ? "Close Vet🐾Care Assistant" : "Ask Vet🐾Care Assistant"}
      </Button>

      {/* Background overlay for mobile */}
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

      {/* Chat Drawer */}
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
              <Button size="sm" variant="ghost" onClick={handleClose}>
                ✖
              </Button>
            </div>

            {/* Chat Body */}
            <div className="flex flex-col flex-grow overflow-y-auto p-4 gap-3 chat-scroll-container">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-2xl shadow-sm max-w-[90%] ${msg.role === "user"
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
              />
              <Button
                onClick={handleAsk}
                disabled={loading}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {loading ? "Sending..." : "Send"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
