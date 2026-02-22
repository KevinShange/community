'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import type { ConversationSummary, DirectMessageItem } from '@/types/models';
import ComposerImageUpload from './ComposerImageUpload';

function getMessagesHeaders(handle: string): HeadersInit {
  return { 'Content-Type': 'application/json', 'x-user-handle': handle };
}

function formatListTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff < oneDay && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diff < 2 * oneDay && d.getDate() === now.getDate() - 1) return 'YESTERDAY';
  if (diff < 7 * oneDay) {
    return d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  }
  return d.toLocaleDateString();
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateGroup(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - d.getTime();
  if (diff < oneDay && d.getDate() === now.getDate()) return 'TODAY';
  if (diff < 2 * oneDay && d.getDate() === now.getDate() - 1) return 'YESTERDAY';
  return d.toLocaleDateString();
}

export default function MessagesView() {
  const { currentUser } = useUserStore();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!currentUser?.handle) return;
    setLoadingConvos(true);
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: getMessagesHeaders(currentUser.handle),
      });
      if (res.ok) {
        const list = (await res.json()) as ConversationSummary[];
        setConversations(list);
      } else {
        setConversations([]);
      }
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvos(false);
    }
  }, [currentUser?.handle]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedHandle || !currentUser?.handle) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    fetch(`/api/messages?with=${encodeURIComponent(selectedHandle)}`, {
      headers: getMessagesHeaders(currentUser.handle),
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((list: DirectMessageItem[]) => setMessages(list))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedHandle, currentUser?.handle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!currentUser?.handle || !selectedHandle) return;
    const content = inputContent.trim();
    if (!content && imageUrls.length === 0) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: getMessagesHeaders(currentUser.handle),
        body: JSON.stringify({
          receiverHandle: selectedHandle,
          content: content || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });
      if (res.ok) {
        const newMsg = (await res.json()) as DirectMessageItem;
        setMessages((prev) => [...prev, newMsg]);
        setInputContent('');
        setImageUrls([]);
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.partner.handle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const selectedPartner = selectedHandle
    ? conversations.find((c) => c.partner.handle === selectedHandle)?.partner
    : null;

  if (!currentUser) return null;

  return (
    <div className="flex h-full min-h-0 bg-gray-950 text-gray-100">
      {/* 左欄：對話列表 */}
      <aside className="w-[320px] flex-shrink-0 border-r border-gray-800 flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-100">Conversations</h1>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-lg font-bold cursor-pointer"
              aria-label="New conversation"
            >
              +
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            {conversations.filter((c) => c.lastMessage).length} conversations
          </p>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-4 pr-4 bg-gray-800 rounded-full text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0"
          />
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium"
            >
              All
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full text-gray-500 hover:bg-gray-800 text-sm"
            >
              Work
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full text-gray-500 hover:bg-gray-800 text-sm"
            >
              Groups
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {loadingConvos ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No conversations yet.</div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.partner.handle === selectedHandle;
              return (
                <button
                  key={conv.partner.handle}
                  type="button"
                  onClick={() => setSelectedHandle(conv.partner.handle)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50 ${
                    isSelected ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.partner.avatar}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" title="Online" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100 truncate">{conv.partner.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage
                        ? conv.lastMessage.imageUrls?.length
                          ? '📷 Image'
                          : conv.lastMessage.content || '—'
                        : 'No messages yet'}
                    </p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatListTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 右欄：聊天內容 */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {!selectedPartner ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 flex-shrink-0">
              <img
                src={selectedPartner.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-100">{selectedPartner.name}</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-800"
                aria-label="Info"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-800"
                aria-label="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </header>

            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-4"
            >
              {loadingMessages ? (
                <div className="text-gray-500 py-4">Loading messages...</div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">No messages yet. Say hi!</p>
                  ) : (
                    (() => {
                      let lastDate = '';
                      return messages.map((msg) => {
                        const dateGroup = formatDateGroup(msg.createdAt);
                        const showDate = dateGroup !== lastDate;
                        if (showDate) lastDate = dateGroup;
                        const isMe = msg.sender.handle === currentUser.handle;
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="flex justify-center py-2">
                                <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                                  {dateGroup}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              {!isMe && (
                                <img
                                  src={msg.sender.avatar}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                                />
                              )}
                              <div
                                className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}
                              >
                                {msg.imageUrls && msg.imageUrls.length > 0 && (
                                  <div
                                    className={`flex flex-wrap gap-1 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}
                                  >
                                    {msg.imageUrls.map((url) => (
                                      <a
                                        key={url}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded-lg overflow-hidden border border-gray-700 max-w-[240px]"
                                      >
                                        <img
                                          src={url}
                                          alt=""
                                          className="w-full h-auto max-h-48 object-cover"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}
                                {msg.content ? (
                                  <div
                                    className={`px-4 py-2 rounded-2xl ${
                                      isMe
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-800 text-gray-100'
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                ) : null}
                                <span
                                  className={`text-xs text-gray-500 mt-0.5 ${isMe ? 'mr-1' : 'ml-1'}`}
                                >
                                  {formatMessageTime(msg.createdAt)}
                                  {isMe && (
                                    <span className="ml-1 inline-block" title="Sent">
                                      ✓
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ComposerImageUpload
                  imageUrls={imageUrls}
                  onChange={setImageUrls}
                  label="Attach image"
                  folder="messages"
                />
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-800 flex-shrink-0"
                  aria-label="Emoji"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-w-0 h-10 px-4 bg-gray-800 rounded-full text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || (!inputContent.trim() && imageUrls.length === 0)}
                  className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
                  aria-label="Send"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-2">PRESS ENTER TO SEND</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
