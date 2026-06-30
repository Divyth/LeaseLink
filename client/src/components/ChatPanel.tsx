import { useEffect, useMemo, useState } from 'react';
import type { Conversation, Message } from '../types';
import { timeLabel } from '../utils/format';

export function ChatPanel({
  conversation,
  messages,
  currentUserId,
  onSend,
  typingLabel,
  onTyping,
  socketReady
}: {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSend: (body: string) => Promise<void>;
  typingLabel?: string;
  onTyping?: (value: string) => void;
  socketReady?: boolean;
}) {
  const [body, setBody] = useState('');
  const participants = useMemo(() => {
    if (!conversation) return null;
    return currentUserId === conversation.ownerId ? conversation.tenant : conversation.owner;
  }, [conversation, currentUserId]);

  useEffect(() => {
    setBody('');
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <div className="card flex h-full items-center justify-center p-8 text-sm text-ink/60">
        Select a conversation to start talking.
      </div>
    );
  }

  return (
    <section className="card flex h-full flex-col overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">{participants?.name ?? 'Conversation'}</h3>
            <p className="text-sm text-ink/60">{conversation.listing.title}</p>
          </div>
          <div className="text-xs text-ink/50">{socketReady ? 'Live' : 'Offline'}</div>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-sm ${mine ? 'bg-ink text-white' : 'bg-sand text-ink'}`}>
                <p>{message.body}</p>
                <div className={`mt-2 text-[11px] ${mine ? 'text-white/65' : 'text-ink/55'}`}>{timeLabel(message.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-line p-4">
        <div className="mb-2 text-xs text-ink/60">{typingLabel ?? '\u00a0'}</div>
        <form
          className="flex gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const text = body.trim();
            if (!text) return;
            await onSend(text);
            setBody('');
            onTyping?.('');
          }}
        >
          <input
            className="field flex-1"
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              onTyping?.(event.target.value);
            }}
            placeholder="Write a message..."
          />
          <button className="btn-primary" type="submit">Send</button>
        </form>
      </div>
    </section>
  );
}

