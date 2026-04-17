"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, User, Settings, LogOut, CheckCheck, AlertTriangle, Pill, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HeaderIcons() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [userName, setUserName] = useState("User");

    // Load User Name for Profile
    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserName(localStorage.getItem("yukti_user_name") || "User");
        }
    }, []);

    // Close dropdowns when clicking outside
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = () => {
        if (confirm("Are you sure you want to sign out?")) {
            // Clear IDENTITY only, keeps data for next demo load technically, 
            // but enables "Login" screen to appear.
            localStorage.removeItem("yukti_auth_v2");
            window.location.reload();
        }
    };

    const notifications = [
        {
            id: 1,
            icon: <Pill size={16} strokeWidth={1.5} className="text-cyan-400" />,
            bg: "bg-cyan-500/10",
            title: "Medicine Reminder",
            desc: "Levolin Rotacaps due at 9:00 PM.",
            time: "10m ago"
        },
        {
            id: 2,
            icon: <Activity size={16} strokeWidth={1.5} className="text-red-400" />,
            bg: "bg-red-500/10",
            title: "Health Alert",
            desc: "Assessment indicates High Metabolic Risk.",
            time: "2h ago"
        },
        {
            id: 3,
            icon: <User size={16} strokeWidth={1.5} className="text-cyan-400" />,
            bg: "bg-cyan-500/10",
            title: "Dr. Aruna",
            desc: "Updated your Care Plan.",
            time: "1d ago"
        }
    ];

    return (
        <div className="flex items-center gap-4 relative z-50">

            {/* --- NOTIFICATIONS --- */}
            <div className="relative" ref={notifRef}>
                <button
                    onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all relative group"
                >
                    <Bell size={20} strokeWidth={1.5} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                    {hasUnread && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                    )}
                </button>

                <AnimatePresence>
                    {showNotifications && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-6 w-85 bg-slate-950/90 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] border border-white/10 overflow-hidden origin-top-right z-[60]"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="data-label !text-white !tracking-[0.2em]">Care Activity</h3>
                                {hasUnread && (
                                    <button
                                        onClick={() => setHasUnread(false)}
                                        className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest hover:text-cyan-300 flex items-center gap-2 transition-colors font-[family-name:var(--font-outfit)]"
                                    >
                                        <CheckCheck size={12} strokeWidth={1.5} /> Mark Read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-6 border-b border-white/5 hover:bg-white/[0.03] transition-colors flex gap-5 cursor-pointer group">
                                        <div className={`h-11 w-11 rounded-2xl ${n.bg} border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                            {n.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white tracking-tight font-[family-name:var(--font-outfit)]">{n.title}</h4>
                                            <p className="text-[11px] text-slate-500 font-light mt-1 font-[family-name:var(--font-inter)] leading-relaxed">{n.desc}</p>
                                            <p className="data-label !text-[8px] !text-slate-700 !tracking-[0.1em] mt-3 uppercase">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 text-center bg-white/[0.02]">
                                <button className="data-label !text-slate-600 hover:!text-white transition-colors cursor-pointer text-[9px]">View All Signals</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- PROFILE --- */}
            <div className="relative" ref={profileRef}>
                <button
                    onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                    className="h-10 w-10 overflow-hidden rounded-full bg-white/[0.03] border border-white/10 hover:ring-2 hover:ring-white/5 transition-all flex items-center justify-center group"
                >
                    <span className="text-white font-bold text-sm font-[family-name:var(--font-outfit)] opacity-60 group-hover:opacity-100 transition-opacity">{userName.charAt(0).toUpperCase()}</span>
                </button>

                <AnimatePresence>
                    {showProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-6 w-80 bg-slate-950/90 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] border border-white/10 overflow-hidden origin-top-right z-[60]"
                        >
                            <div className="p-8 bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-3xl bg-white text-slate-950 flex items-center justify-center text-xl font-bold shadow-3xl font-[family-name:var(--font-outfit)]">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white tracking-tight font-[family-name:var(--font-outfit)]">{userName}</h3>
                                        <p className="data-label !text-cyan-400 !tracking-[0.1em] mt-1 uppercase">
                                            {localStorage.getItem('yukti_user_age') ? `${localStorage.getItem('yukti_user_age')} • ${localStorage.getItem('yukti_user_gender')}` : 'Clinical Identity'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 space-y-2">
                                <button
                                    onClick={() => alert("Protocol settings are currently locked.")}
                                    className="w-full flex items-center justify-between px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-white/[0.04] hover:text-white rounded-2xl transition-all font-[family-name:var(--font-outfit)]"
                                >
                                    <div className="flex items-center gap-4">
                                        <Settings size={14} strokeWidth={1.5} /> Profile & Protocol
                                    </div>
                                </button>

                                <div className="h-px bg-white/5 my-3 mx-4"></div>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-between px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all font-[family-name:var(--font-outfit)]"
                                >
                                    <div className="flex items-center gap-4">
                                        <LogOut size={14} strokeWidth={1.5} /> Secure Sign-Out
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
