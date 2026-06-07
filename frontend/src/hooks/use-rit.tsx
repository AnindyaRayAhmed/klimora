import { useState, useEffect } from 'react';
import { ritClient } from '../lib/api/domains.client';
import { useAppStore } from '../store';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isOptimistic?: boolean;
};

export function useRitChat() {
  const { ritActiveConversationId, setRitActiveConversationId, selectedLocalityId } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);

  // Load conversation history if we switch conversations
  useEffect(() => {
    if (!ritActiveConversationId) {
      setMessages([{ id: 'intro', role: 'assistant', content: 'I am Rit, your climate intelligence analyst. How can I help?' }]);
      return;
    }
    
    ritClient.getConversationHistory(ritActiveConversationId).then(res => {
      if (res.messages) {
        setMessages(res.messages.map((m:any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })));
      }
    }).catch(console.error);
  }, [ritActiveConversationId]);

  // Poll for proactive insights every 2 minutes
  useEffect(() => {
    if (!selectedLocalityId) return;

    const fetchInsights = () => {
      ritClient.getInsights(selectedLocalityId).then(res => {
        setInsights(res.data || []);
      }).catch(console.error);
    };

    fetchInsights();
    const interval = setInterval(fetchInsights, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLocalityId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !selectedLocalityId) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, isOptimistic: true };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    try {
      const res = await ritClient.chat(text, selectedLocalityId, ritActiveConversationId || undefined);
      
      if (!ritActiveConversationId && res.conversationId) {
        setRitActiveConversationId(res.conversationId);
      }

      const assistantMsg: ChatMessage = {
        id: res.message.id,
        role: 'assistant',
        content: res.message.content
      };

      setMessages(prev => {
        // remove the optimistic user msg and replace with definitive flow
        const withoutOptimistic = prev.filter(m => !m.isOptimistic);
        return [...withoutOptimistic, { ...userMsg, isOptimistic: false }, assistantMsg];
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I encountered an error connecting to my climate intelligence.' }]);
    } finally {
      setThinking(false);
    }
  };

  return { messages, thinking, sendMessage, insights };
}
