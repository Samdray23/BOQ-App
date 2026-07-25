import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MessageSquare, Send, Mic, Bot, User, Clock, Plus, Sparkles } from 'lucide-react';
import { Button, Input, EmptyState } from '@/components/shared';
import { cn } from '@/lib/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
  messages: Message[];
}

const AI_RESPONSE_PLACEHOLDER =
  "I'm your AI estimation assistant. I can help with BOQ generation, cost estimation, material analysis, and rate analysis. Please note that this is a demo environment — connect a real AI backend for live responses.";

const suggestions = [
  'Generate BOQ for a residential building',
  'Compare material prices across regions',
  'Calculate concrete quantities for a slab',
  'Create a rate analysis for plastering work',
];

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! I'm your BOQ AI Assistant. How can I help you with your construction estimation today?",
  timestamp: new Date(),
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="flex size-8 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--sys-primary)', color: 'var(--sys-on-primary)' }}
      >
        <Bot size={16} />
      </div>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: 'var(--sys-primary)' }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex items-start gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: isUser ? 'var(--sys-primary)' : 'var(--sys-surface-variant)',
          color: isUser ? 'var(--sys-on-primary)' : 'var(--sys-on-surface-variant)',
        }}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex max-w-[75%] flex-col gap-1">
        <div
          className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line"
          style={{
            backgroundColor: isUser ? 'var(--sys-primary-container)' : 'var(--sys-surface-variant)',
            color: isUser ? 'var(--sys-on-primary-container)' : 'var(--sys-on-surface-variant)',
            borderBottomRightRadius: isUser ? 4 : 16,
            borderBottomLeftRadius: isUser ? 16 : 4,
          }}
        >
          {message.content}
        </div>
        <span
          className="flex items-center gap-1 px-1 text-xs"
          style={{ color: 'var(--sys-on-surface-variant)' }}
        >
          <Clock size={10} />
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl px-3 py-2.5 text-left transition-colors"
      style={{
        backgroundColor: isActive ? 'var(--sys-secondary-container)' : 'transparent',
        color: isActive ? 'var(--sys-on-secondary-container)' : 'var(--sys-on-surface)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sys-surface-variant)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="flex items-center gap-2">
        <MessageSquare size={14} style={{ color: 'var(--sys-primary)' }} />
        <span className="truncate text-sm font-medium">{conversation.title}</span>
      </div>
      <span className="mt-1 block text-xs" style={{ color: 'var(--sys-on-surface-variant)' }}>
        {formatDate(conversation.updatedAt)}
      </span>
    </button>
  );
}

export default function AiAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const now = new Date();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setConversations((prev) => {
      if (activeConversationId) {
        return prev.map((c) =>
          c.id === activeConversationId ? { ...c, updatedAt: now } : c
        );
      }

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: content.trim().slice(0, 60),
        updatedAt: now,
        messages: [userMessage],
      };
      setActiveConversationId(newConversation.id);
      return [...prev, newConversation];
    });

    await new Promise((r) => setTimeout(r, 1500));

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: AI_RESPONSE_PLACEHOLDER,
      timestamp: new Date(),
    };

    setIsLoading(false);
    setMessages((prev) => [...prev, assistantMessage]);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, userMessage, assistantMessage], updatedAt: new Date() }
          : c
      )
    );
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleMicrophone = () => {
    toast('Voice input coming soon', {
      icon: <Mic size={16} />,
    });
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex" style={{ height: 'calc(100vh - var(--sys-top-bar-height, 64px))' }}>
      <aside
        className="flex w-72 shrink-0 flex-col border-r p-4"
        style={{
          borderColor: 'var(--sys-outline-variant)',
          backgroundColor: 'var(--sys-surface)',
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--sys-on-surface-variant)' }}
          >
            Conversations
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setMessages([welcomeMessage]);
              setActiveConversationId(null);
            }}
          >
            <Plus size={14} />
            New
          </Button>
        </div>

        {conversations.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<MessageSquare size={24} />}
              title="No conversations yet"
              description="Start a new chat to begin"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setMessages([welcomeMessage, ...conv.messages]);
                }}
              />
            ))}
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col" style={{ backgroundColor: 'var(--sys-surface)' }}>
        <div
          className="flex items-center gap-3 border-b px-6 py-3"
          style={{
            borderColor: 'var(--sys-outline-variant)',
            backgroundColor: 'var(--sys-surface-container)',
          }}
        >
          <Bot size={20} style={{ color: 'var(--sys-primary)' }} />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--sys-on-surface)' }}>
              BOQ AI Assistant
            </h3>
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--sys-on-surface-variant)' }}
            >
              <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: 'var(--sys-primary)' }}
              />
              Online
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={<MessageSquare size={32} />}
                title="Start a conversation"
                description="Ask me anything about BOQ and construction estimation"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TypingIndicator />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div
          className="border-t px-6 pb-4 pt-3"
          style={{
            borderColor: 'var(--sys-outline-variant)',
            backgroundColor: 'var(--sys-surface-container)',
          }}
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestion(suggestion)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--sys-secondary-container)',
                  color: 'var(--sys-on-secondary-container)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sys-primary-container)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sys-secondary-container)')
                }
              >
                <Sparkles size={12} />
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about BOQ, materials, rates..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
              <Send size={16} />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleMicrophone} disabled={isLoading}>
              <Mic size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
