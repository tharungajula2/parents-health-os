"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Video, ArrowLeft, MoreVertical, Paperclip, Smile, Mic, CheckCheck, Clock } from "lucide-react";

interface Message {
    id: number;
    text: string;
    sender: "bot" | "user";
    timestamp: string;
    status: "sent" | "delivered" | "read";
    type?: "text" | "option";
    options?: string[]; // Quick replies
}

export function WhatsAppDemo() {
    const [messages, setMessages] = useState<Message[]>([
        // Initial state with demo message
        {
            id: 1,
            text: "Namaste Nani! 🙏\nTime for your afternoon medicines:\n- Glycomet 850mg (After Food)",
            sender: "bot",
            timestamp: "1:30 PM",
            status: "read",
            type: "option",
            options: ["Taken ✅", "Snooze 30m ⏰"]
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        // 1. Add User Message
        const tempId = Date.now();
        const userMsg: Message = {
            id: tempId,
            text: text,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent"
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // 2. Trigger Bot Response
        setIsTyping(true);

        setTimeout(() => {
            let botText = "I've logged that for you. Anything else?";
            let options: string[] | undefined = undefined;

            const lower = text.toLowerCase();
            if (lower.includes("taken") || lower.includes("yes")) {
                botText = "Great! 👍 I've updated your log. \n\nHow is your knee pain today on a scale of 1-10?";
                options = ["No Pain", "Mild (1-3)", "Moderate (4-6)", "Severe (7-10)"];
            } else if (lower.includes("snooze")) {
                botText = "Okay Nani, I will remind you again in 30 minutes. Please eat something before taking it! 🍎";
            } else if (lower.includes("pain") || lower.match(/[0-9]/)) {
                // Simple logic: if number or pain mentioned
                botText = "Noted. I'll share this with Dr. Aruna in the weekly report. Rest well! 🛋️";
            } else {
                botText = "I am just a demo bot right now, but I am learning! 🧠";
            }

            const botMsg: Message = {
                id: Date.now() + 1,
                text: botText,
                sender: "bot",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: "read",
                type: options ? "option" : "text",
                options: options
            };

            setIsTyping(false);
            setMessages(prev => [...prev, botMsg]);

        }, 1500); // 1.5s delay for realism
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-full bg-slate-950 p-4 relative overflow-hidden space-y-10">
            {/* --- HEADER --- */}
            <div className="w-full max-w-4xl px-2 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-1">WhatsApp Bot</h2>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Conversational clinical support on your familiar messaging channel.</p>
            </div>
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* PHONE FRAME */}
            <div className="w-[380px] h-[720px] bg-slate-900 rounded-[3.5rem] p-3 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative border-[6px] border-slate-800 ring-1 ring-white/10">

                {/* Dynamic island / Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30 shadow-inner"></div>

                {/* SCREEN */}
                <div className="w-full h-full bg-slate-950 rounded-[2.8rem] overflow-hidden flex flex-col relative border border-white/5">
                    {/* BLUEPRINT PATTERN */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

                    {/* HEADER */}
                    <div className="bg-slate-900/80 backdrop-blur-xl text-white p-5 pt-12 flex items-center justify-between border-b border-white/5 shadow-lg z-20 shrink-0">
                        <div className="flex items-center gap-4">
                            <ArrowLeft size={18} className="cursor-pointer text-slate-400 hover:text-white transition-colors" />
                            <div className="relative">
                                <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                    <span className="text-cyan-400 font-black text-lg">Y</span>
                                </div>
                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-cyan-400 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-widest leading-tight">Yukti Neural</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></span>
                                    <p className="text-[9px] font-black text-cyan-400/60 uppercase tracking-tighter">Synchronized</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 text-slate-400">
                            <Video size={18} className="hover:text-cyan-400 transition-colors cursor-pointer" />
                            <Phone size={18} className="hover:text-cyan-400 transition-colors cursor-pointer" />
                            <MoreVertical size={18} className="hover:text-cyan-400 transition-colors cursor-pointer" />
                        </div>
                    </div>

                    {/* CHAT AREA */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-24 scrollbar-hide">
                        {messages.map((msg) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                            >
                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[85%] px-5 py-4 rounded-[1.5rem] shadow-xl relative border ${msg.sender === "user"
                                        ? "bg-cyan-500 border-cyan-400 text-slate-950 rounded-tr-none font-bold text-sm shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                                        : "glass-card bg-white/5 border-white/10 text-slate-200 rounded-tl-none font-medium text-sm"
                                        }`}
                                >
                                    <p className="whitespace-pre-line leading-relaxed tracking-tight">{msg.text}</p>
                                    <div className="flex items-center justify-end gap-2 mt-2 opacity-50">
                                        <span className="text-[8px] font-black uppercase tracking-tighter">[{msg.timestamp}]</span>
                                        {msg.sender === "user" && <CheckCheck size={12} className="text-slate-900" />}
                                    </div>
                                </div>

                                {/* Quick Replies (Bot only) */}
                                {msg.sender === 'bot' && msg.options && (
                                    <div className="flex flex-wrap gap-2 mt-4 px-2">
                                        {msg.options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSendMessage(opt)}
                                                className="bg-slate-900/60 border border-cyan-500/20 text-cyan-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-500 transition-all active:scale-95"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/5 w-fit ml-2">
                                <div className="h-1.5 w-1.5 bg-cyan-400/60 rounded-full animate-bounce delay-75"></div>
                                <div className="h-1.5 w-1.5 bg-cyan-400/80 rounded-full animate-bounce delay-150"></div>
                                <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="absolute bottom-6 w-[92%] left-[4%] bg-slate-900/90 backdrop-blur-2xl p-2 px-3 flex items-center gap-3 z-30 rounded-[2rem] border border-white/10 shadow-2xl">
                        <div className="p-2 text-slate-500 hover:text-cyan-400 transition-colors pointer-events-none">
                            <Smile size={22} />
                        </div>
                        
                        <div className="flex-1 px-1">
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                                placeholder="Quantum interface..."
                                className="w-full bg-transparent text-[11px] font-black uppercase tracking-widest outline-none text-white placeholder:text-slate-600"
                            />
                        </div>

                        <div className="flex gap-1">
                            <div className="p-2 text-slate-500 hover:text-cyan-400 transition-colors pointer-events-none">
                                <Paperclip size={18} />
                            </div>
                            
                            {inputValue.trim() ? (
                                <button onClick={() => handleSendMessage(inputValue)} className="p-2.5 bg-cyan-500 text-slate-950 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-110 active:scale-90 transition-all">
                                    <Send size={16} strokeWidth={3} className="translate-x-0.5" />
                                </button>
                            ) : (
                                <div className="p-2.5 bg-slate-800 text-slate-400 rounded-full shadow-md cursor-pointer hover:text-cyan-400 transition-colors">
                                    <Mic size={16} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Screen reflection effect */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-20" />
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full"></div>
            </div>
        </div>
    );
}
