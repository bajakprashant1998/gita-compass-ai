import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type TableName = 
  | "shloks" 
  | "problems" 
  | "chapters" 
  | "languages" 
  | "ai_search_rules" 
  | "shlok_problems"
  | "admin_activity_log";

type Operation = "create" | "update" | "delete" | "bulk_update";

interface RequestBody {
  table: TableName;
  operation: Operation;
  data?: Record<string, unknown>;
  id?: string;
  ids?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { table, operation, data, id, ids } = (await req.json()) as RequestBody;

    // Validate table name
    const allowedTables: TableName[] = [
      "shloks",
      "problems",
      "chapters",
      "languages",
      "ai_search_rules",
      "shlok_problems",
      "admin_activity_log",
    ];

    if (!allowedTables.includes(table)) {
      return new Response(
        JSON.stringify({ error: `Invalid table: ${table}` }),
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

        const { data: created, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single();

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

        const { data: updated, error } = await supabase
          .from(table)
          .update(data)
          .eq("id", id)
          .select()
          .single();

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

        const { error } = await supabase
          .from(table)
          .update(data)
          .in("id", ids);

        if (error) throw error;
        result = { success: true, updated: ids.length };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Invalid operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Admin CRUD error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
