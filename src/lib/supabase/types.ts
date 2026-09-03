export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      care_recipients: {
        Row: {
          id: string
          family_id: string
          display_name: string
          relationship: string
          date_of_birth: string | null
          primary_language: string
          timezone: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          display_name: string
          relationship: string
          date_of_birth?: string | null
          primary_language?: string
          timezone?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          display_name?: string
          relationship?: string
          date_of_birth?: string | null
          primary_language?: string
          timezone?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consents: {
        Row: {
          id: string
          care_recipient_id: string
          consent_type: string
          status: string
          notes: string | null
          recorded_by: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          care_recipient_id: string
          consent_type: string
          status?: string
          notes?: string | null
          recorded_by: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          care_recipient_id?: string
          consent_type?: string
          status?: string
          notes?: string | null
          recorded_by?: string
          recorded_at?: string
          created_at?: string
        }
      }
      health_documents: {
        Row: {
          id: string
          care_recipient_id: string
          storage_path: string
          document_type: string
          filename: string
          mime_type: string
          uploaded_by: string
          uploaded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          care_recipient_id: string
          storage_path: string
          document_type: string
          filename: string
          mime_type: string
          uploaded_by: string
          uploaded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          care_recipient_id?: string
          storage_path?: string
          document_type?: string
          filename?: string
          mime_type?: string
          uploaded_by?: string
          uploaded_at?: string
          created_at?: string
        }
      }
      document_extractions: {
        Row: {
          id: string
          health_document_id: string
          ai_provider: string
          model_version: string
          extracted_data: Json
          extracted_at: string
          review_status: string
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          health_document_id: string
          ai_provider?: string
          model_version: string
          extracted_data: Json
          extracted_at?: string
          review_status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          health_document_id?: string
          ai_provider?: string
          model_version?: string
          extracted_data?: Json
          extracted_at?: string
          review_status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_conditions: {
        Row: {
          id: string
          care_recipient_id: string
          name: string
          status: string
          notes: string | null
          provenance: string
          source_extraction_id: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          care_recipient_id: string
          name: string
          status?: string
          notes?: string | null
          provenance?: string
          source_extraction_id?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          care_recipient_id?: string
          name?: string
          status?: string
          notes?: string | null
          provenance?: string
          source_extraction_id?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_observations: {
        Row: {
          id: string
          care_recipient_id: string
          category: string
          observed_at: string
          value_numeric: number | null
          value_sys: number | null
          value_dia: number | null
          value_text: string | null
          unit: string | null
          source: string
          source_document_id: string | null
          recorded_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          care_recipient_id: string
          category: string
          observed_at?: string
          value_numeric?: number | null
          value_sys?: number | null
          value_dia?: number | null
          value_text?: string | null
          unit?: string | null
          source?: string
          source_document_id?: string | null
          recorded_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          care_recipient_id?: string
          category?: string
          observed_at?: string
          value_numeric?: number | null
          value_sys?: number | null
          value_dia?: number | null
          value_text?: string | null
          unit?: string | null
          source?: string
          source_document_id?: string | null
          recorded_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      care_routines: {
        Row: {
          id: string
          care_recipient_id: string
          name: string
          description: string | null
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          care_recipient_id: string
          name: string
          description?: string | null
          category: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          care_recipient_id?: string
          name?: string
          description?: string | null
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Backward compatibility aliases for existing UI components
      parents: {
        Row: {
          id: string
          family_id: string
          name: string
          relationship: string
          phone: string | null
          language: string | null
          primary_conditions: string[] | null
          risk_level: string | null
          health_index: number | null
          scorecard_answers: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          relationship: string
          phone?: string | null
          language?: string | null
          primary_conditions?: string[] | null
          risk_level?: string | null
          health_index?: number | null
          scorecard_answers?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          relationship?: string
          phone?: string | null
          language?: string | null
          primary_conditions?: string[] | null
          risk_level?: string | null
          health_index?: number | null
          scorecard_answers?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vitals: {
        Row: {
          id: string
          parent_id: string
          bp_sys: number | null
          bp_dia: number | null
          sugar: number | null
          weight: number | null
          source: string | null
          measured_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          bp_sys?: number | null
          bp_dia?: number | null
          sugar?: number | null
          weight?: number | null
          source?: string | null
          measured_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          bp_sys?: number | null
          bp_dia?: number | null
          sugar?: number | null
          weight?: number | null
          source?: string | null
          measured_at?: string | null
          created_at?: string | null
        }
      }
      medications: {
        Row: {
          id: string
          care_recipient_id: string
          name: string
          dosage: string
          instructions: string | null
          is_active: boolean
          provenance: string
          source_extraction_id: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          care_recipient_id: string
          name: string
          dosage: string
          instructions?: string | null
          is_active?: boolean
          provenance?: string
          source_extraction_id?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          care_recipient_id?: string
          name?: string
          dosage?: string
          instructions?: string | null
          is_active?: boolean
          provenance?: string
          source_extraction_id?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medication_schedules: {
        Row: {
          id: string
          medication_id: string
          local_time: string
          timezone: string
          applicable_days: string[]
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          medication_id: string
          local_time: string
          timezone?: string
          applicable_days?: string[]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          medication_id?: string
          local_time?: string
          timezone?: string
          applicable_days?: string[]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medication_events: {
        Row: {
          id: string
          schedule_id: string
          due_at: string
          status: string
          responded_at: string | null
          response_source: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          due_at: string
          status?: string
          responded_at?: string | null
          response_source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          due_at?: string
          status?: string
          responded_at?: string | null
          response_source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      care_routine_schedules: {
        Row: {
          id: string
          routine_id: string
          local_time: string
          timezone: string
          applicable_days: string[]
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          local_time: string
          timezone?: string
          applicable_days?: string[]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          local_time?: string
          timezone?: string
          applicable_days?: string[]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      care_routine_events: {
        Row: {
          id: string
          schedule_id: string
          due_at: string
          status: string
          responded_at: string | null
          response_source: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          due_at: string
          status?: string
          responded_at?: string | null
          response_source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          due_at?: string
          status?: string
          responded_at?: string | null
          response_source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          parent_id: string
          taken: boolean
          log_date: string
          logged_at: string | null
        }
        Insert: {
          id?: string
          medication_id: string
          parent_id: string
          taken: boolean
          log_date: string
          logged_at?: string | null
        }
        Update: {
          id?: string
          medication_id?: string
          parent_id?: string
          taken?: boolean
          log_date?: string
          logged_at?: string | null
        }
      }
      lab_reports: {
        Row: {
          id: string
          parent_id: string
          report_date: string
          report_type: string
          summary: string | null
          biomarkers: Json | null
          full_analysis_markdown: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          report_date: string
          report_type: string
          summary?: string | null
          biomarkers?: Json | null
          full_analysis_markdown?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          report_date?: string
          report_type?: string
          summary?: string | null
          biomarkers?: Json | null
          full_analysis_markdown?: string | null
          created_at?: string | null
        }
      }
      ai_conversations: {
        Row: {
          id: string
          parent_id: string
          user_message: string
          ai_response: string
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          user_message: string
          ai_response: string
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          user_message?: string
          ai_response?: string
          created_at?: string | null
        }
      }
      whatsapp_messages: {
        Row: {
          id: string
          parent_id: string
          direction: string
          body: string
          media_url: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          parent_id: string
          direction: string
          body: string
          media_url?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          parent_id?: string
          direction?: string
          body?: string
          media_url?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
    }
  }
}
