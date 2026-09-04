import { assertServerOnly } from '../supabase/safety';

export const GRAPH_API_VERSION = "v26.0";
export const GRAPH_API_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export interface WhatsAppConfig {
  phoneNumberId: string | null;
  businessAccountId: string | null;
  accessToken: string | null;
  verifyToken: string | null;
  appSecret: string | null;
  reminderCronSecret: string | null;
  medicationTemplate: string | null;
  routineTemplate: string | null;
  isConfigured: boolean;
}

export const getWhatsAppConfig = (): WhatsAppConfig => {
  assertServerOnly('whatsapp/config');

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || null;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || null;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || null;
  const appSecret = process.env.WHATSAPP_APP_SECRET || null;
  const reminderCronSecret = process.env.REMINDER_CRON_SECRET || null;
  const medicationTemplate = process.env.WHATSAPP_MEDICATION_TEMPLATE || null;
  const routineTemplate = process.env.WHATSAPP_ROUTINE_TEMPLATE || null;

  const isConfigured = !!(phoneNumberId && accessToken);

  return {
    phoneNumberId,
    businessAccountId,
    accessToken,
    verifyToken,
    appSecret,
    reminderCronSecret,
    medicationTemplate,
    routineTemplate,
    isConfigured,
  };
};
