import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { getWhatsAppConfig } from './config';
import { assertNotForbiddenProject, assertServerOnly } from '../supabase/safety';

export function createDirectServerClient() {
  assertServerOnly('whatsapp/service');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  assertNotForbiddenProject(url);
  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Standardizes Indian phone numbers to clean E.164 style (e.g. +919848022338)
 */
export const formatIndianPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+91${cleaned.slice(1)}`;
  }
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }
  
  if (phone.trim().startsWith("+")) {
    return `+${cleaned}`;
  }
  
  return `+${cleaned}`;
};

/**
 * Records a message event (incoming/outgoing) directly in Supabase
 */
export const recordMessage = async (params: {
  parentId: string;
  direction: "incoming" | "outgoing";
  body: string;
  mediaUrl?: string | null;
  messageType?: string;
  messageSid?: string | null;
  status: string;
}) => {
  const supabase = createDirectServerClient() as any;
  if (!supabase) {
    console.warn("[WhatsApp Service] Supabase not connected. Skipping DB logging.");
    return null;
  }
  
  const { data, error } = await supabase
    .from("whatsapp_messages")
    .insert({
      parent_id: params.parentId,
      direction: params.direction,
      body: params.body,
      media_url: params.mediaUrl || null,
      message_type: params.messageType || (params.mediaUrl ? "media" : "text"),
      message_sid: params.messageSid || null,
      status: params.status,
    })
    .select()
    .single();
    
  if (error) {
    console.error("[WhatsApp Service] Error inserting message to database:", error);
  }
  return data;
};

/**
 * Sends a WhatsApp message via Meta Cloud API, or performs a safe dry-run write
 */
export const sendWhatsAppMessage = async (
  parentId: string,
  phone: string,
  body: string,
  templateName?: string
) => {
  const config = getWhatsAppConfig();
  const formattedPhone = formatIndianPhoneNumber(phone);
  
  if (config.isDryRun || !config.isConfigured) {
    console.log(`[WhatsApp Dry Run] Outbound message to ${formattedPhone}: "${body}"`);
    const dbRecord = await recordMessage({
      parentId,
      direction: "outgoing",
      body,
      messageSid: `dry-run-${Date.now()}`,
      status: "dry_run",
    });
    return { success: true, dryRun: true, data: dbRecord };
  }

  // Real Meta Cloud API Call
  try {
    const url = `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`;
    
    // Meta requires phone numbers without a leading plus sign
    const cleanToPhone = formattedPhone.replace("+", "");
    
    let payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanToPhone,
    };

    if (templateName) {
      payload.type = "template";
      payload.template = {
        name: templateName,
        language: { code: "en" }
      };
    } else {
      payload.type = "text";
      payload.text = { body };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error?.message || "WhatsApp Meta API rejected request");
    }

    const waMessageId = resData.messages?.[0]?.id;
    const dbRecord = await recordMessage({
      parentId,
      direction: "outgoing",
      body,
      messageSid: waMessageId,
      status: "sent",
    });

    return { success: true, dryRun: false, data: dbRecord };
  } catch (err: any) {
    console.error("[WhatsApp Service] Real send attempt failed:", err);
    // Fallback log of failed record to DB
    const dbRecord = await recordMessage({
      parentId,
      direction: "outgoing",
      body,
      status: "failed",
    });
    return { success: false, error: err.message, data: dbRecord };
  }
};
