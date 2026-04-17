"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Video, MapPin, CheckCircle, CreditCard, Wallet, FileText, Plus, ShieldCheck, ChevronRight, X, User, Clock } from "lucide-react";
import { useToast } from "./ui/Toast";

interface Appointment {
    id: string;
    date: string; // "Feb 10"
    time: string; // "10:00 AM"
    doctor: string;
    type: string;
    status: "Confirmed" | "Completed" | "Pending";
    isPast?: boolean;
}

const DEFAULT_APPOINTMENTS: Appointment[] = [
    {
        id: "1",
        date: "Feb 10",
        time: "10:00 AM",
        doctor: "Dr. Aruna Desai",
        type: "Geriatric Review • Video Consultation",
        status: "Confirmed",
        isPast: false
    },
    {
        id: "2",
        date: "Jan 12",
        time: "09:00 AM",
        doctor: "Annual Lab Panel",
        type: "Home Collection • Thyrocare",
        status: "Completed",
        isPast: true
    }
];

export function ClinicHub() {
    const { showToast } = useToast();

    // --- STATE ---
    const [balance, setBalance] = useState(1250);
    const [appointments, setAppointments] = useState<Appointment[]>(DEFAULT_APPOINTMENTS);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Form State
    const [bookForm, setBookForm] = useState({
        specialist: "Dr. Aruna Desai",
        date: "",
        time: ""
    });

    // --- ACTIONS ---

    const handleTopUp = () => {
        showToast("Processing Secure Payment...", "info");
        setTimeout(() => {
            setBalance(prev => prev + 1000);
            showToast("₹1,000 added to Praan Wallet successfully!", "success");
        }, 1500);
    };

    const handleBookAppointment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookForm.date || !bookForm.time) {
            showToast("Please select valid date and time", "error");
            return;
        }

        // Parse date for display (Simplified logic for demo)
        const dateObj = new Date(bookForm.date);
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const day = dateObj.getDate();
        const dateStr = `${month} ${day}`;

        const newAppt: Appointment = {
            id: Date.now().toString(),
            date: dateStr,
            time: bookForm.time,
            doctor: bookForm.specialist,
            type: "Video Consultation",
            status: "Confirmed",
            isPast: false
        };

        // Optimistic UI Update: Add to top
        setAppointments(prev => [newAppt, ...prev]);
        setShowBookingModal(false);
        showToast("Appointment Booked! Dr. Desai notified.", "success");

        // Reset Form
        setBookForm({ specialist: "Dr. Aruna Desai", date: "", time: "" });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 relative">
            {/* HEADER */}
            <div className="px-2">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-1">Care Hub</h2>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Manage consultations, insurance, and medical records.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* LEFT COLUMN: UPCOMING VISITS (Span 2) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                                <Calendar size={20} strokeWidth={2.5} />
                            </div>
                            Appointment Schedule
                        </h3>
                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95 shadow-xl"
                        >
                            <Plus size={14} strokeWidth={4} /> Book Appointment
                        </button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {appointments.map((appt) => (
                                <motion.div
                                    key={appt.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`glass-card p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${appt.isPast
                                        ? "bg-slate-950/20 border-white/5 opacity-60"
                                        : "bg-slate-950/40 border-white/5 shadow-2xl hover:border-cyan-500/20"
                                        }`}
                                >
                                    {/* Ambient Glow for Active */}
                                    {!appt.isPast && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
                                    )}

                                    {/* Status Badge (Only for active) */}
                                    {!appt.isPast && (
                                        <div className="absolute top-8 right-8">
                                            <span className="bg-slate-950 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span> {appt.status}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                                        {/* Date Box */}
                                        <div className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center w-full md:w-28 shrink-0 border shadow-inner ${appt.isPast 
                                            ? "bg-slate-950 border-white/5 text-slate-600" 
                                            : "bg-slate-950 border-cyan-500/20"
                                            }`}>
                                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${appt.isPast ? "text-slate-700" : "text-cyan-500/60"}`}>{appt.date.split(' ')[0]}</span>
                                            <span className={`text-3xl font-black tracking-tighter ${appt.isPast ? "text-slate-500" : "text-white"}`}>{appt.date.split(' ')[1]}</span>
                                            {!appt.isPast && <span className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-tighter">{appt.time}</span>}
                                        </div>

                                        <div className="flex-1 w-full text-center md:text-left">
                                            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                                                <div>
                                                    <h4 className={`text-xl font-black tracking-tight mb-2 ${appt.isPast ? "text-slate-400" : "text-white group-hover:text-cyan-400 transition-colors uppercase"}`}>{appt.doctor}</h4>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{appt.type}</p>
                                                </div>
                                                {appt.isPast && (
                                                    <span className="flex items-center gap-2 text-slate-600 text-[9px] font-black uppercase bg-slate-950 border border-white/5 px-3 py-1 rounded-full self-center md:self-start mb-4 md:mb-0 tracking-[0.2em]">
                                                        <CheckCircle size={10} /> Previous
                                                    </span>
                                                )}
                                            </div>

                                            {!appt.isPast && (
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                                                        <Video size={14} strokeWidth={3} /> Join Call
                                                    </button>
                                                    <button className="bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-400 hover:text-white px-8 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                                                        Reschedule
                                                    </button>
                                                </div>
                                            )}
                                            {appt.isPast && (
                                                <button className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-cyan-400 transition-colors border-b border-transparent hover:border-cyan-500/30 pb-1">Review Visit Summary</button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT COLUMN: FINANCE (Span 1) */}
                <div className="lg:col-span-1 space-y-10">
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-4 px-2">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Wallet size={20} strokeWidth={2.5} />
                        </div>
                        Health Finance
                    </h3>

                    {/* WALLET CARD */}
                    <div className="glass-card bg-slate-950/60 border border-cyan-500/20 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck size={160} />
                        </div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full" />

                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Insurance Coverage</p>
                                <h4 className="font-black text-lg flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-cyan-400" /> Yukti Health Shield
                                </h4>
                            </div>
                            <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[9px] font-black border border-cyan-500/20 tracking-widest">
                                ACTIVE
                            </span>
                        </div>

                        <div className="space-y-1 relative z-10 mb-10">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Policy Number</p>
                            <p className="font-mono text-xl tracking-[0.3em] text-white">YUK-8829-X</p>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Wallet Balance</p>
                                <AnimatePresence mode="popLayout">
                                    <motion.p
                                        key={balance}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-3xl font-black tracking-tighter text-white"
                                    >
                                        ₹{balance.toLocaleString()}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={handleTopUp}
                                className="bg-white hover:bg-slate-200 text-slate-950 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                            >
                                Top Up
                            </button>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="glass-card bg-slate-950/40 border border-white/5 p-4 rounded-[2rem] space-y-3">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-900/60 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-950 border border-white/5 text-cyan-400 rounded-xl group-hover:border-cyan-500/30 transition-all">
                                    <FileText size={18} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Review Claims History</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-900/60 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-950 border border-white/5 text-white/40 rounded-xl group-hover:border-white/20 transition-all">
                                    <CreditCard size={18} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Manage Payment Cards</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>

            {/* BOOKING MODAL */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowBookingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card bg-slate-950 border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                            
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="absolute top-8 right-8 p-3 bg-slate-900 border border-white/5 text-slate-500 hover:text-white rounded-full transition-all hover:rotate-90"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Schedule Appointment</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Request a time for a virtual or clinic-based visit.</p>

                            <form onSubmit={handleBookAppointment} className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3 mb-3">
                                        <User size={12} className="text-cyan-500" /> Select Specialist
                                    </label>
                                    <select
                                        className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl font-black text-slate-300 focus:text-white focus:border-cyan-500/50 outline-none appearance-none cursor-pointer transition-all"
                                        value={bookForm.specialist}
                                        onChange={(e) => setBookForm({ ...bookForm, specialist: e.target.value })}
                                    >
                                        <option value="Dr. Aruna Desai" className="bg-slate-950">Dr. Aruna Desai (Geriatric Optimization)</option>
                                        <option value="Dr. Esha Solanki" className="bg-slate-950">Dr. Esha Solanki (Cardiovascular)</option>
                                        <option value="Coach Vikram" className="bg-slate-950">Coach Vikram (Physio-Kinetics)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3 mb-3">
                                        <Calendar size={12} className="text-cyan-500" /> Select Date
                                    </label>
                                        <input
                                            type="date"
                                            className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl font-black text-slate-300 focus:text-white focus:border-cyan-500/50 outline-none transition-all text-xs"
                                            value={bookForm.date}
                                            onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3 mb-3">
                                            <Clock size={12} className="text-cyan-500" /> Select Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl font-black text-slate-300 focus:text-white focus:border-cyan-500/50 outline-none transition-all text-xs"
                                            value={bookForm.time}
                                            onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] active:scale-95"
                                    >
                                        Confirm Appointment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

