import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type TableName =
  | "shloks"
  | "problems"
  | "chapters"
  | "languages"
  | "ai_search_rules"
  | "shlok_problems"
  | "admin_activity_log"
  | "page_seo_metadata"
  | "blog_posts"
  | "contact_submissions"
  | "web_stories";

type Operation = "create" | "update" | "delete" | "bulk_update" | "upsert";

interface RequestBody {
  table: TableName;
  operation: Operation;
  data?: Record<string, unknown>;
  id?: string;
  ids?: string[];
  conflictColumns?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Authentication: verify the caller's JWT ──
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a client scoped to the caller's JWT to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Authorization: verify admin role ──
    const { data: isAdmin, error: roleError } = await userClient
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Proceed with service-role client for the actual operation ──
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { table, operation, data, id, ids, conflictColumns } = (await req.json()) as RequestBody;

    // Validate table name
    const allowedTables: TableName[] = [
      "shloks", "problems", "chapters", "languages",
      "ai_search_rules", "shlok_problems", "admin_activity_log",
      "page_seo_metadata", "blog_posts", "contact_submissions", "web_stories",
    ];

    if (!allowedTables.includes(table)) {
      return new Response(
        JSON.stringify({ error: "Invalid table" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (operation) {
      case "create": {
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Data is required for create operation" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: created, error } = await supabase.from(table).insert(data).select().single();
        if (error) throw error;
        result = created;
        break;
      }

      case "update": {
        if (!id || !data) {
          return new Response(
            JSON.stringify({ error: "ID and data are required for update operation" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: updated, error } = await supabase.from(table).update(data).eq("id", id).select().single();
        if (error) throw error;
        result = updated;
        break;
      }

      case "delete": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID is required for delete operation" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        result = { success: true, deleted: id };
        break;
      }

      case "bulk_update": {
        if (!ids || !data) {
          return new Response(
            JSON.stringify({ error: "IDs and data are required for bulk_update operation" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { error } = await supabase.from(table).update(data).in("id", ids);
        if (error) throw error;
        result = { success: true, updated: ids.length };
        break;
      }

      case "upsert": {
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Data is required for upsert operation" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: upserted, error } = await supabase
          .from(table)
          .upsert(data, { onConflict: conflictColumns || "id", ignoreDuplicates: false })
          .select()
          .single();
        if (error) throw error;
        result = upserted;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid operation" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Admin CRUD error:", error);

    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as { code: string };
      if (dbError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "This record already exists. Please use a different combination." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (dbError.code === "23503") {
        return new Response(
          JSON.stringify({ error: "Referenced record not found. Please check your selections." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
