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
            icon: <Pill size={16} className="text-cyan-400" />,
            bg: "bg-cyan-500/10",
            title: "Medicine Reminder",
            desc: "Levolin Rotacaps due at 9:00 PM.",
            time: "10m ago"
        },
        {
            id: 2,
            icon: <Activity size={16} className="text-red-400" />,
            bg: "bg-red-500/10",
            title: "Health Alert",
            desc: "Assessment indicates High Metabolic Risk.",
            time: "2h ago"
        },
        {
            id: 3,
            icon: <User size={16} className="text-cyan-400" />,
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
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative"
                >
                    <Bell size={20} />
                    {hasUnread && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                    )}
                </button>

                <AnimatePresence>
                    {showNotifications && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-85 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] border border-white/10 overflow-hidden origin-top-right z-[60]"
                        >
                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="font-black text-white text-xs uppercase tracking-widest">Neural Notifications</h3>
                                {hasUnread && (
                                    <button
                                        onClick={() => setHasUnread(false)}
                                        className="text-[10px] text-cyan-400 font-black uppercase tracking-widest hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                    >
                                        <CheckCheck size={12} /> Mark read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-5 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-4 cursor-pointer group">
                                        <div className={`h-10 w-10 rounded-xl ${n.bg} border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            {n.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white tracking-tight">{n.title}</h4>
                                            <p className="text-xs text-slate-400 leading-snug mt-1">{n.desc}</p>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 text-center bg-white/5">
                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white transition-colors">View All Neural Logs</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- PROFILE --- */}
            <div className="relative" ref={profileRef}>
                <button
                    onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                    className="h-10 w-10 overflow-hidden rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:ring-2 hover:ring-cyan-500/20 transition-all flex items-center justify-center"
                >
                    <span className="text-cyan-400 font-black">{userName.charAt(0).toUpperCase()}</span>
                </button>

                <AnimatePresence>
                    {showProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-72 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] border border-white/10 overflow-hidden origin-top-right z-[60]"
                        >
                            <div className="p-6 bg-white/5 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-cyan-500/20">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white tracking-tight">{userName}</h3>
                                        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mt-1">
                                            {localStorage.getItem('yukti_user_age') ? `${localStorage.getItem('yukti_user_age')} • ${localStorage.getItem('yukti_user_gender')}` : 'Clinical Context'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 space-y-1">
                                <button
                                    onClick={() => alert("Settings are locked in this Demo.")}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
                                >
                                    <Settings size={16} /> System Settings
                                </button>

                                <div className="h-px bg-white/5 my-2 mx-2"></div>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                                >
                                    <LogOut size={16} /> Atomic Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
