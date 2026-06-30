import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchConversations, fetchMessages, postMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useSocket } from '../hooks/useSocket';
import type { Conversation, Message } from '../types';
import { LoadingState } from '../components/LoadingState';
import { ChatPanel } from '../components/ChatPanel';
import { timeLabel } from '../utils/format';

type SendAck = {
  ok: boolean;
  message?: Message;
  error?: string;
};

export function InboxPage() {
  const { token, user } = useAuth();
  const socket = useSocket(token);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedConversationId = searchParams.get('conversation');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const appendMessageIfMissing = (nextMessage: Message) => {
    setMessages((current) => {
      if (current.some((message) => message.id === nextMessage.id)) return current;
      return [...current, nextMessage];
    });
  };

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const result = await fetchConversations(token);
      setConversations(result.conversations);
      const selectedId = selectedConversationId ?? result.conversations[0]?.id;
      const selected = result.conversations.find((conversation) => conversation.id === selectedId) ?? result.conversations[0] ?? null;
      setActive(selected);
      if (selected) {
        const details = await fetchMessages(selected.id, token);
        setMessages(details.messages);
        setSearchParams({ conversation: selected.id }, { replace: true });
      }
      setLoading(false);
    };
    void load();
  }, [selectedConversationId, setSearchParams, token]);

  useEffect(() => {
    if (!socket || !active) return;
    socket.emit('conversation:join', { conversationId: active.id });
    const onNew = ({ message }: { message: Message }) => {
      if (message.conversationId === active.id) appendMessageIfMissing(message);
    };
    const onTypingStart = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId === active.id && userId !== user?.id) setTypingUserId(userId);
    };
    const onTypingStop = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId === active.id && userId !== user?.id) setTypingUserId(null);
    };
    socket.on('message:new', onNew);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    return () => {
      socket.off('message:new', onNew);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [active, socket, user?.id]);

  const typingLabel = useMemo(() => {
    if (!typingUserId || !active) return '';
    const other = active.ownerId === typingUserId ? active.owner : active.tenant;
    return `${other.name} is typing...`;
  }, [active, typingUserId]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><LoadingState /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Inbox</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="card max-h-[76vh] overflow-y-auto p-4">
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const last = conversation.messages?.[0];
              const activeClass = active?.id === conversation.id ? 'border-ink bg-ink text-white' : 'border-line bg-white';
              return (
                <button
                  key={conversation.id}
                  className={`w-full rounded-3xl border p-4 text-left transition ${activeClass}`}
                  onClick={async () => {
                    setActive(conversation);
                    const details = await fetchMessages(conversation.id, token!);
                    setMessages(details.messages);
                    setSearchParams({ conversation: conversation.id }, { replace: true });
                  }}
                >
                  <div className="font-semibold">{conversation.listing.title}</div>
                  <div className={`mt-1 text-sm ${active?.id === conversation.id ? 'text-white/70' : 'text-ink/60'}`}>{conversation.ownerId === user?.id ? conversation.tenant.name : conversation.owner.name}</div>
                  <div className={`mt-2 text-xs ${active?.id === conversation.id ? 'text-white/60' : 'text-ink/50'}`}>
                    {last ? `${last.body.slice(0, 48)}${last.body.length > 48 ? '...' : ''}` : 'No messages yet'}
                  </div>
                  {last && <div className={`mt-2 text-[11px] ${active?.id === conversation.id ? 'text-white/45' : 'text-ink/45'}`}>{timeLabel(last.createdAt)}</div>}
                </button>
              );
            })}
            {!conversations.length && <div className="text-sm text-ink/60">No conversations yet.</div>}
          </div>
        </aside>
        <div className="h-[76vh]">
          <ChatPanel
            conversation={active}
            messages={messages}
            currentUserId={user!.id}
            typingLabel={typingLabel}
            socketReady={Boolean(socket)}
            onTyping={(value) => {
              if (!socket || !active) return;
              if (value.trim()) socket.emit('typing:start', { conversationId: active.id });
              else socket.emit('typing:stop', { conversationId: active.id });
            }}
            onSend={async (body) => {
              if (!socket || !active) {
                await postMessage(active!.id, body, token!);
                const details = await fetchMessages(active!.id, token!);
                setMessages(details.messages);
                return;
              }
              socket.emit('message:send', { conversationId: active.id, body }, async (response: SendAck) => {
                if (!response?.ok) {
                  const result = await postMessage(active.id, body, token!);
                  appendMessageIfMissing(result.message);
                  return;
                }
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
