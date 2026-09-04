import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/whatsapp/service";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // 1. Authenticate Supabase user
    const authHeader = req.headers.get("authorization");
    let user: any = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && anonKey) {
        const client = createServerClient(url, anonKey, {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {},
          },
        });
        const { data: userData } = await client.auth.getUser(token);
        user = userData?.user;
      }
    }

    if (!user) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && anonKey) {
        const client = createServerClient(url, anonKey, {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {},
          },
        });
        const { data: userData } = await client.auth.getUser();
        user = userData?.user;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const { documentId } = body;
    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json({ success: false, error: "Valid documentId required." }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient() as any;
    if (!serviceClient) {
      return NextResponse.json({ success: false, error: "Database client offline." }, { status: 500 });
    }

    // 3. Fetch target health_documents record to resolve canonical storage_path and family_id
    const { data: docRow, error: fetchErr } = await serviceClient
      .from("health_documents")
      .select("id, care_recipient_id, storage_path, care_recipient:care_recipients!inner(family_id)")
      .eq("id", documentId)
      .maybeSingle();

    if (fetchErr || !docRow) {
      return NextResponse.json({ success: false, error: "Health document not found." }, { status: 404 });
    }

    const familyId = (docRow.care_recipient as any)?.family_id;
    if (!familyId) {
      return NextResponse.json({ success: false, error: "Invalid document relationship." }, { status: 400 });
    }

    // 4. Verify user's active family membership and role authorization (owner or caregiver only)
    const { data: membership } = await serviceClient
      .from("family_members")
      .select("id, role, status")
      .eq("family_id", familyId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ success: false, error: "Unauthorized: You do not belong to this family care network." }, { status: 403 });
    }

    if (membership.role === "viewer") {
      return NextResponse.json({ success: false, error: "Forbidden: Read-only viewers cannot delete health documents." }, { status: 403 });
    }

    // 5. Delete private storage object using canonical storage_path resolved strictly from DB row
    const storagePath = docRow.storage_path;
    if (storagePath) {
      const { error: storageErr } = await serviceClient.storage
        .from("health-documents")
        .remove([storagePath]);

      if (storageErr) {
        console.error(`[Remove Document] Storage removal failed for path ${storagePath}:`, storageErr.message);
        return NextResponse.json(
          { success: false, error: "Failed to remove document file from storage. Database metadata preserved." },
          { status: 500 }
        );
      }
    }

    // 6. Delete target health_documents row metadata (relying on PostgreSQL FK ON DELETE CASCADE for document_extractions)
    const { error: docDelErr } = await serviceClient
      .from("health_documents")
      .delete()
      .eq("id", documentId);

    if (docDelErr) {
      console.error(`[Remove Document] Error deleting health_documents row ${documentId}:`, docDelErr.message);
      return NextResponse.json(
        { success: false, error: "Failed to delete document metadata. Retry is safe as storage object has been purged." },
        { status: 500 }
      );
    }

    console.log(`[Remove Document] Successfully deleted health document ${documentId} (storagePath: ${storagePath}) by user ${user.id} (role: ${membership.role})`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Remove Document Error]:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error." }, { status: 500 });
  }
}
