import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Flame, Bot } from "lucide-react";
import { GameService } from "../services/api";

export default function Chatbot({
  welcomeMessage = "Hey adventurer! I'm your AI mentor 🚀 Ask me anything about DSA!",
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await GameService.chatWithSupport(userMessage);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data?.response || "Try again" },
      ]);
    } catch (err) {
      const isAuthError = err?.response?.status === 401;
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: isAuthError
            ? "Please sign in to use mentor chat."
            : "Server error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#7d5e33] bg-[#f5e6c2] shadow-[0_3px_0_#9a7642,0_6px_0_#694a25,0_10px_12px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#efd8a8]"
        aria-label={open ? "Close mentor chat" : "Open mentor chat"}
      >
        {open ? (
          <X className="h-5 w-5 text-[#6b3f13]" />
        ) : (
          <MessageCircle className="h-5 w-5 text-[#6b3f13]" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pixel-ui-panel fixed bottom-24 right-6 z-50 w-[340px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#6f522b] bg-[#efd8a8] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-[#7d5c31] bg-[#f7e7c4] shadow-[0_2px_0_#9f7842]">
                  <Bot className="h-4 w-4 text-[#6b3f13]" />
                </div>
                <div>
                  <p className="font-pixel text-[0.5rem] uppercase tracking-widest text-[#7a5a2d]">
                    DSA Mentor
                  </p>
                  <p className="text-[10px] font-semibold text-[#5c6747]">
                    {loading ? "Thinking..." : "Online"}
                  </p>
                </div>
              </div>
              <Flame className="h-5 w-5 text-orange-500" />
            </div>

            {/* Messages */}
            <div className="h-72 space-y-2.5 overflow-y-auto p-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto border-2 border-[#4f6d23] bg-[#82b44f] text-[#f3ffe1] shadow-[0_2px_0_#648834]"
                      : "border-2 border-[#7a5c31] bg-[#f8ebcd] text-[#3a3020] shadow-[0_2px_0_#9a7641]"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-1 px-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                      className="h-2 w-2 rounded-full bg-[#8b5a2b]"
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex border-t-2 border-[#6f522b] bg-[#efd8a8]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about DSA..."
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-3 text-sm text-[#3a3020] placeholder:text-[#9a8a6a] outline-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 text-[#6b3f13] transition hover:text-[#a96710] disabled:opacity-30"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
