import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Flame } from "lucide-react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey, I am your DSA mentor 🚀" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply || "Try again" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server error 💀" },
      ]);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-orange-400 to-red-500 p-4"
      >
        {open ? <X /> : <MessageCircle />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 right-6 z-50 w-[320px] rounded-2xl border border-white/10 bg-[#0d1722] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="font-semibold text-white selection:bg-amber-500 selection:text-black">DSA Mentor</p>
              <Flame className="text-orange-400" />
            </div>

            <div className="h-72 space-y-2 overflow-y-auto p-3 text-white">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-lg p-2 text-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-orange-500 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex border-t border-white/10">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask DSA..."
                className="flex-1 bg-transparent p-3 text-sm outline-none text-white selection:bg-amber-500 selection:text-black"
              />
              <button
                onClick={sendMessage}
                className="p-3 text-orange-400 hover:text-orange-300"
              >
                <Send />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
