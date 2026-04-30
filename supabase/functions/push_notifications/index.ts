import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req) => {
  // Validate request method
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    
    // Check if payload contains the expected webhook structure
    const record = payload.record || payload; // Support both direct test calls and webhooks
    if (!record || !record.user_id || !record.id) {
      return new Response("Invalid payload: Missing user_id or id", { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch push tokens for the user
    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", record.user_id)
      .eq("is_active", true);

    if (tokensError) {
      console.error("Error fetching tokens:", tokensError);
      return new Response("Error fetching tokens", { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      console.log(`No active tokens found for user ${record.user_id}`);
      return new Response(JSON.stringify({ success: true, message: "No tokens found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construct Expo Push Notification messages
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title: record.title_ar,
      body: record.body_ar,
      data: {
        notification_type: record.notification_type,
        related_entity_id: record.related_entity_id,
        related_entity_type: record.related_entity_type,
      },
    }));

    // Send notifications via Expo
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();
    console.log("Expo API Result:", JSON.stringify(expoResult));

    // Mark notification as sent
    await supabase
      .from("notification_queue")
      .update({ is_sent: true, sent_at: new Date().toISOString() })
      .eq("id", record.id);

    return new Response(
      JSON.stringify({ success: true, expoResult }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
