import { assertServerOnly } from '../supabase/safety';
import { getWhatsAppConfig, GRAPH_API_BASE_URL } from './config';

export interface WhatsAppButton {
  id: string;
  title: string;
}

/**
  Normalizes Indian phone numbers safely to clean E.164 format (+91XXXXXXXXXX).
  Returns null if phone is missing or invalid.
 */
export const formatIndianPhoneNumber = (phone: string | null | undefined): string | null => {
  if (!phone) return null;
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return `+91${digitsOnly.slice(1)}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }
  if (phone.trim().startsWith("+") && digitsOnly.length > 10) {
    return `+${digitsOnly}`;
  }
  return null;
};

/**
  Masks E.164 phone numbers for privacy in application logs.
  e.g., "+919876543210" -> "+91••••••3210"
 */
export const maskPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "[No Phone]";
  const formatted = formatIndianPhoneNumber(phone);
  if (!formatted) return "[Invalid Phone]";
  if (formatted.length <= 6) return formatted;
  return `${formatted.slice(0, 3)}••••••${formatted.slice(-4)}`;
};

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
  Dispatches an interactive button message or template message via official Meta WhatsApp Cloud API (Graph API v26.0).
 */
export const sendMetaWhatsAppMessage = async (params: {
  toPhone: string;
  bodyText: string;
  buttons: WhatsAppButton[];
  templateName?: string | null;
  templateParameters?: string[];
}): Promise<SendWhatsAppResult> => {
  assertServerOnly('whatsapp/client');

  const config = getWhatsAppConfig();
  if (!config.isConfigured || !config.phoneNumberId || !config.accessToken) {
    return {
      success: false,
      error: "WhatsApp Cloud API credentials not configured on server (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN).",
    };
  }

  const formattedPhone = formatIndianPhoneNumber(params.toPhone);
  if (!formattedPhone) {
    return {
      success: false,
      error: "Invalid recipient phone number format. Must resolve to clean E.164 (+91XXXXXXXXXX).",
    };
  }

  // Meta Cloud API requires recipient phone number without leading '+'
  const cleanToPhone = formattedPhone.replace("+", "");
  const endpoint = `${GRAPH_API_BASE_URL}/${config.phoneNumberId}/messages`;

  let payload: any;

  if (params.templateName) {
    // Template delivery format for pre-approved Meta utility templates
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanToPhone,
      type: "template",
      template: {
        name: params.templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: (params.templateParameters || []).map((val) => ({
              type: "text",
              text: val,
            })),
          },
          ...params.buttons.map((btn, index) => ({
            type: "button",
            sub_type: "quick_reply",
            index: String(index),
            parameters: [
              {
                type: "payload",
                payload: btn.id,
              },
            ],
          })),
        ],
      },
    };
  } else {
    // Direct interactive button message format
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanToPhone,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: params.bodyText,
        },
        action: {
          buttons: params.buttons.map((btn) => ({
            type: "reply",
            reply: {
              id: btn.id,
              title: btn.title.slice(0, 20), // Meta button title limit is 20 chars
            },
          })),
        },
      },
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await res.json();
    if (!res.ok) {
      const errMsg = resData?.error?.message || `Meta API HTTP ${res.status}`;
      console.error(`[WhatsApp Client] Meta API error for ${maskPhoneNumber(formattedPhone)}: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    const messageId = resData.messages?.[0]?.id;
    console.log(`[WhatsApp Client] Successfully dispatched reminder to ${maskPhoneNumber(formattedPhone)} (msgId: ${messageId})`);
    return { success: true, messageId };
  } catch (err: any) {
    console.error(`[WhatsApp Client] Exception sending to ${maskPhoneNumber(formattedPhone)}:`, err?.message || err);
    return { success: false, error: err?.message || "Network error contacting Meta API" };
  }
};
