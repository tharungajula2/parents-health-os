import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, Sparkles, MessageSquare, Trash2, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Parents Health OS",
  description: "Privacy policy and data handling transparency for Parents Health OS.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C2826] flex flex-col justify-between p-6 sm:p-12 font-[family-name:var(--font-outfit)] selection:bg-teal-100">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* Header / Navigation */}
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E5E5A] hover:text-[#0C4E4B] transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Console</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFECE6] shadow-sm">
            <ShieldCheck size={14} className="text-[#0E5E5A]" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600">
              Data Privacy & Security
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C2826]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
            Parents Health OS is a quiet family care coordination system designed to help family members organize medication routines, care schedules, and health records for aging parents. This policy explains how information is handled within the application.
          </p>
          <p className="text-[11px] text-slate-400 font-medium pt-1">
            Last Updated: September 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-xs sm:text-sm font-light text-slate-700 leading-relaxed">
          
          {/* Section 1: Information We Store */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#0E5E5A]">
              <Database size={18} />
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1C2826]">
                1. Information We Collect & Store
              </h2>
            </div>
            <p>
              To maintain an active family care log, Parents Health OS stores information created or uploaded directly by authorized family members:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-600">
              <li><strong>Account & Family Profile:</strong> Authenticated user identifiers, family member names, relationships, and notification settings.</li>
              <li><strong>Care Recipient Profiles:</strong> Names, relationships, language preferences, and care schedules for parents.</li>
              <li><strong>Health Records & Observations:</strong> Medication names, dosages, care routines, logged vitals (blood pressure, glucose, weight), symptoms, and health documents (prescriptions, lab reports).</li>
              <li><strong>Care Execution Events:</strong> Logs of medication adherence responses, routine completions, and delivery status events.</li>
            </ul>
          </section>

          {/* Section 2: Infrastructure & Service Providers */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#0E5E5A]">
              <Lock size={18} />
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1C2826]">
                2. Infrastructure & Trusted Service Providers
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">A. Supabase (Database, Auth & Private Storage)</h3>
                <p className="mt-1">
                  We use Supabase for user authentication, structured database storage, and encrypted private document storage. Uploaded medical documents are kept in restricted storage buckets accessible only by authenticated requests.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">B. Google Gemini (Document Extraction)</h3>
                <p className="mt-1">
                  Google Gemini API is used strictly for document text extraction and key fact summarization when a user explicitly uploads or triggers document analysis. Gemini API processes document text to structure data for caregiver review. It does not provide medical diagnoses, prescriptions, or autonomous treatment plans.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">C. Meta WhatsApp Cloud API (Care Reminders)</h3>
                <p className="mt-1">
                  The official Meta WhatsApp Cloud API is used to dispatch scheduled medication and care routine reminders to registered family phone numbers and process structured quick-reply button responses (e.g., Taken, Done, Skip, Snooze). Free-text incoming WhatsApp messages are not routed to an automated AI medical chatbot.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Data Access & Authorization */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#0E5E5A]">
              <ShieldCheck size={18} />
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1C2826]">
                3. Access Control & Authorization
              </h2>
            </div>
            <p>
              Access to family health records is strictly restricted to authenticated users belonging to the specific family care network. Our role-based access model enforces permissions across family owners, caregivers, and viewers. Health data is never exposed publicly or shared with unauthorized accounts.
            </p>
            <p>
              <strong>We do NOT sell, rent, or monetize personal health data</strong> to third-party advertisers, data brokers, or marketing networks.
            </p>
          </section>

          {/* Section 4: Document Removal & Data Retention */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#0E5E5A]">
              <Trash2 size={18} />
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1C2826]">
                4. Data Retention & Caregiver Deletion
              </h2>
            </div>
            <p>
              Uploaded health documents can be deleted at any time by authorized caregiver or owner users through the app’s Health Records interface. Deleting a document permanently removes the underlying private storage file and associated document extractions.
            </p>
            <p>
              Health records and care logs are retained as needed to maintain the active family health history until modified or deleted by an authorized family member.
            </p>
          </section>

          {/* Section 5: Regulatory & Medical Disclaimer */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#0E5E5A]">
              <Sparkles size={18} />
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1C2826]">
                5. Scope & Medical Disclaimer
              </h2>
            </div>
            <p>
              Parents Health OS is a personal family care management tool and is not a certified medical device, clinical diagnostic software, or emergency health alert service. Information provided within the application is for organizational reference by family members and should not replace professional medical advice, diagnosis, or emergency intervention.
            </p>
          </section>

          {/* Section 6: Contact Us */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#0E5E5A]">
              <Mail size={18} />
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1C2826]">
                6. Contact & Privacy Inquiries
              </h2>
            </div>
            <p>
              If you have any questions regarding this Privacy Policy or wish to request data management assistance, please contact the application administration at your designated family care account support contact.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-[#EFECE6] pt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest">
          Parents Health OS // Quiet Family Care Console
        </div>
      </div>
    </div>
  );
}
