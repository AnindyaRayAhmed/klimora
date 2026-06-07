import { SupabaseClient } from "@supabase/supabase-js";
import { RitConversationMemory, RitIntent } from "./rit.types.js";

export class MemoryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getMemory(conversationId: string): Promise<RitConversationMemory> {
    const { data: conv } = await this.supabase
      .from("rit_conversations")
      .select("metadata")
      .eq("id", conversationId)
      .single();

    const { data: messages } = await this.supabase
      .from("rit_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(6);

    const recentMessages = (messages || []).reverse().map(m => ({
      role: m.role,
      content: m.content
    }));

    return {
      recentMessages,
      discussedTopics: conv?.metadata?.discussedTopics || [],
      recentSummary: conv?.metadata?.recentSummary || ""
    };
  }

  async saveMessage(conversationId: string, role: "user" | "assistant", content: string, intent?: RitIntent, contextSummary?: string) {
    await this.supabase.from("rit_messages").insert({
      conversation_id: conversationId,
      role,
      content,
      intent: intent || null,
      context_summary: contextSummary || null,
      citations: [],
      created_at: new Date().toISOString()
    });
  }

  async getOrCreateConversation(userId: string, localityId: string, conversationId?: string) {
    if (conversationId) {
      const { data } = await this.supabase
        .from("rit_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", userId)
        .single();
      if (data) return data.id;
    }

    const { data: newConv, error } = await this.supabase
      .from("rit_conversations")
      .insert({
        user_id: userId,
        locality_id: localityId,
        title: "New Conversation",
        metadata: { discussedTopics: [], recentSummary: "" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error || !newConv) {
      throw new Error(`Failed to create conversation: ${error?.message}`);
    }
    
    return newConv.id;
  }
}
