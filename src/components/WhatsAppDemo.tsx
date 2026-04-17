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
                botText = "I am a prototype assistant for this demo! How else can I help? 🌟";
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
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase font-[family-name:var(--font-outfit)]">Care Hub</h2>
                <p className="text-sm text-slate-500 font-light font-[family-name:var(--font-inter)] tracking-wide mt-2">Sample messaging interface demonstration with a care companion.</p>
            </div>
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* PHONE FRAME */}
            <div className="w-[390px] h-[750px] bg-slate-950 rounded-[4rem] p-3 shadow-3xl relative border-[1px] border-white/10 ring-[6px] ring-slate-900/50">

                {/* Dynamic island / Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30 shadow-inner"></div>

                {/* SCREEN */}
                <div className="w-full h-full bg-slate-950 rounded-[2.8rem] overflow-hidden flex flex-col relative border border-white/5">
                    {/* BLUEPRINT PATTERN */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

                    {/* HEADER */}
                    <div className="bg-slate-950/80 backdrop-blur-3xl text-white p-6 pt-12 flex items-center justify-between border-b border-white/5 shadow-2xl z-20 shrink-0">
                        <div className="flex items-center gap-5">
                            <ArrowLeft size={16} strokeWidth={1.5} className="cursor-pointer text-slate-500 hover:text-white transition-colors" />
                            <div className="relative">
                                <div className="h-11 w-11 bg-white text-slate-950 border border-white/5 rounded-full flex items-center justify-center overflow-hidden shadow-3xl font-bold font-[family-name:var(--font-outfit)]">
                                    Y
                                </div>
                                <div className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-cyan-400 rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.6)]"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-[13px] uppercase tracking-tight leading-tight font-[family-name:var(--font-outfit)]">Yukti Care</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                    <p className="data-label !text-[8px] !text-cyan-400/60 !tracking-[0.1em]">PROTOTYPE CHAT</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-5 text-slate-500">
                            <Video size={16} strokeWidth={1.5} className="hover:text-cyan-400 transition-colors cursor-pointer" />
                            <Phone size={16} strokeWidth={1.5} className="hover:text-cyan-400 transition-colors cursor-pointer" />
                            <MoreVertical size={16} strokeWidth={1.5} className="hover:text-cyan-400 transition-colors cursor-pointer" />
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
                                    className={`max-w-[85%] px-6 py-5 rounded-3xl shadow-2xl relative border font-[family-name:var(--font-inter)] ${msg.sender === "user"
                                        ? "bg-white border-white text-slate-950 rounded-tr-none font-medium text-[13px] shadow-3xl"
                                        : "bg-white/[0.04] border-white/5 backdrop-blur-3xl text-slate-200 rounded-tl-none font-light text-[13px]"
                                        }`}
                                >
                                    <p className="whitespace-pre-line leading-relaxed tracking-normal">{msg.text}</p>
                                    <div className="flex items-center justify-end gap-2 mt-3 opacity-40">
                                        <span className="data-label !text-[7px]">{msg.timestamp}</span>
                                        {msg.sender === "user" && <CheckCheck size={12} strokeWidth={1.5} className="text-slate-950" />}
                                    </div>
                                </div>

                                {/* Quick Replies (Bot only) */}
                                {msg.sender === 'bot' && msg.options && (
                                    <div className="flex flex-wrap gap-2.5 mt-5 px-1">
                                        {msg.options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSendMessage(opt)}
                                                className="bg-white/[0.03] border border-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-white hover:text-slate-950 transition-all active:scale-95 font-[family-name:var(--font-outfit)]"
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
                    <div className="absolute bottom-8 w-[90%] left-[5%] bg-slate-950/90 backdrop-blur-3xl p-3 px-4 flex items-center gap-4 z-30 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="p-2 text-slate-600 hover:text-white transition-colors pointer-events-none">
                            <Smile size={20} strokeWidth={1.5} />
                        </div>
                        
                        <div className="flex-1 px-1">
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                                placeholder="Type a message..."
                                className="w-full bg-transparent text-[11px] font-bold uppercase tracking-widest outline-none text-white placeholder:text-slate-800 font-[family-name:var(--font-outfit)]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="p-2 text-slate-600 hover:text-white transition-colors pointer-events-none">
                                <Paperclip size={18} strokeWidth={1.5} />
                            </div>
                            
                            {inputValue.trim() ? (
                                <button onClick={() => handleSendMessage(inputValue)} className="p-3 bg-white text-slate-950 rounded-full shadow-3xl hover:scale-110 active:scale-90 transition-all">
                                    <Send size={14} strokeWidth={2.5} className="translate-x-0.5" />
                                </button>
                            ) : (
                                <div className="p-3 bg-white/5 text-slate-600 rounded-full shadow-md cursor-pointer hover:text-white transition-colors">
                                    <Mic size={14} strokeWidth={1.5} />
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
