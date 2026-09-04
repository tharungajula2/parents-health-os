/**
 * Meta WhatsApp Cloud API Template Configurations
 */

export interface WhatsAppTemplateConfig {
  medicationTemplateName: string | null;
  routineTemplateName: string | null;
}

export const getWhatsAppTemplateConfig = (): WhatsAppTemplateConfig => {
  return {
    medicationTemplateName: process.env.WHATSAPP_MEDICATION_TEMPLATE || null,
    routineTemplateName: process.env.WHATSAPP_ROUTINE_TEMPLATE || null,
  };
};
