'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, X, Send, User, Minimize2, Maximize2, 
  Tag, Trash2, AlertTriangle, ArrowLeft, Search, 
  RefreshCw, Circle, ShieldCheck, Clock 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface Conversation {
  user_id: string;
  user_name: string;
  last_message: string;
  last_message_at: string;
  last_sender: string;
  unread: number;
}

const getUserColor = (userId: string) => {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ];
  if (!userId) return colors[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function AdminMiniChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendError, setSendError] = useState('');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  
  // Product Catalog attachment
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [attachedProduct, setAttachedProduct] = useState<any | null>(null);
  const [productSearch, setProductSearch] = useState('');
  
  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<any>(null);
  const selectedUserRef = useRef<Conversation | null>(null);
  const isOpenRef = useRef(isOpen);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Play gentle notification sound on incoming message
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio notification failed:', e);
    }
  }, []);

  // 1. Fetch catalog products for product attachment
  useEffect(() => {
    const fetchCatalogProducts = async () => {
      try {
        const { data } = await supabase.from('products').select('id, name, price, image').limit(20);
        if (data) setCatalogProducts(data);
      } catch (e) {
        console.warn('Failed loading products for chat:', e);
      }
    };
    fetchCatalogProducts();
  }, []);

  // 2. Fetch list of conversations
  const fetchConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch('/api/chat?action=conversations');
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setConversations(result.data);
      }
    } catch (e) {
      console.warn('Failed to fetch conversations:', e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // 3. Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (pid: string, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(`/api/chat?product_id=${pid}&offset=0&limit=50`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setMessages(prev => {
          const existingTemp = prev.filter(m => String(m.id).startsWith('temp-'));
          return [...result.data, ...existingTemp];
        });

        // Auto mark read if there are unread messages from USER
        const hasUnread = result.data.some((m: any) => m.sender_role === 'USER' && !m.is_read);
        if (hasUnread) {
          fetch('/api/chat', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', product_id: pid })
          }).catch(console.warn);

          if (typingChannelRef.current && isSubscribedRef.current) {
            typingChannelRef.current.send({
              type: 'broadcast',
              event: 'read_receipt',
              payload: { role: 'ADMIN' }
            }).catch(console.warn);
          }

          // Clear unread badge in state
          setConversations(prev => prev.map(c => c.user_id === pid ? { ...c, unread: 0 } : c));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch messages:', e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // 4. REALTIME SUBSCRIPTION FOR ADMIN INBOX
  useEffect(() => {
    fetchConversations(true);

    const channel = supabase
      .channel('admin-mini-inbox-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const eventType = payload.eventType;
          const newMsg = payload.new as any;

          if (eventType === 'INSERT') {
            // Sound notification for incoming customer message
            if (newMsg.sender_role === 'USER') {
              playNotificationSound();
            }

            // A. If this message belongs to the currently open chat room
            const currentSelected = selectedUserRef.current;
            if (currentSelected && currentSelected.user_id === newMsg.product_id) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                const tempIdx = prev.findIndex(
                  (m) => String(m.id).startsWith('temp-') && m.content === newMsg.content
                );
                if (tempIdx !== -1) {
                  const next = [...prev];
                  if (next[tempIdx].is_read) {
                    newMsg.is_read = true;
                  }
                  next[tempIdx] = newMsg;
                  return next;
                }
                return [...prev, newMsg];
              });

              // Mark read immediately if message is from user
              if (newMsg.sender_role === 'USER') {
                fetch('/api/chat', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'mark_read', product_id: currentSelected.user_id }),
                }).catch(console.warn);

                if (typingChannelRef.current && isSubscribedRef.current) {
                  typingChannelRef.current.send({
                    type: 'broadcast',
                    event: 'read_receipt',
                    payload: { role: 'ADMIN' }
                  }).catch(console.warn);
                }
              }
            }

            // B. Always update the conversation list so preview & unread badge reflect in real-time
            setConversations((prev) => {
              const existingIndex = prev.findIndex((c) => c.user_id === newMsg.product_id);
              if (existingIndex > -1) {
                const updated = [...prev];
                const conv = updated[existingIndex];
                const isCurrentOpen =
                  isOpenRef.current && currentSelected?.user_id === newMsg.product_id;
                
                updated[existingIndex] = {
                  ...conv,
                  last_message: newMsg.content,
                  last_message_at: newMsg.created_at,
                  last_sender: newMsg.sender_role,
                  unread:
                    newMsg.sender_role === 'USER' && !isCurrentOpen
                      ? conv.unread + 1
                      : conv.unread,
                };
                // Move to top
                const [item] = updated.splice(existingIndex, 1);
                return [item, ...updated];
              } else {
                // Brand new customer started chatting -> refetch full conversation list
                fetchConversations(false);
                return prev;
              }
            });
          } else if (eventType === 'UPDATE') {
            const updatedMsg = payload.new as any;
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
        } else {
          setIsRealtimeConnected(false);
        }
      });

    // Gentle 5s polling fallback to ensure 100% sync reliability against network dropouts
    const pollInterval = setInterval(() => {
      fetchConversations(false);
      if (selectedUserRef.current) {
        fetchMessages(selectedUserRef.current.user_id, false);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [fetchConversations, fetchMessages, playNotificationSound]);

  // Load messages when an admin selects a user from the inbox
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id, true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);

      // Typing Broadcast Subscription for this user
      typingChannelRef.current = supabase.channel(`typing:${selectedUser.user_id}`, {
        config: { broadcast: { ack: false } }
      });

      typingChannelRef.current
        .on('broadcast', { event: 'typing' }, (payload: any) => {
          if (payload.payload.role === 'USER') {
            setIsUserTyping(payload.payload.isTyping);
          }
        })
        .on('broadcast', { event: 'read_receipt' }, (payload: any) => {
          if (payload.payload.role === 'USER') {
            setMessages(prev => prev.map(m => m.sender_role === 'ADMIN' ? { ...m, is_read: true } : m));
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
            // Send read receipt to User instantly on subscribe
            typingChannelRef.current.send({
              type: 'broadcast',
              event: 'read_receipt',
              payload: { role: 'ADMIN' }
            }).catch(console.warn);
          } else {
            isSubscribedRef.current = false;
          }
        });
    } else {
      setMessages([]);
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
      setIsUserTyping(false);
      isSubscribedRef.current = false;
    }

    return () => {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
    };
  }, [selectedUser, fetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  // Total unread count across all conversations
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  // Send reply message
  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (typingChannelRef.current && selectedUser) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { role: 'ADMIN', isTyping: true }
      }).catch(console.warn);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (typingChannelRef.current) {
          typingChannelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { role: 'ADMIN', isTyping: false }
          }).catch(console.warn);
        }
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedProduct) || !selectedUser || isSending) return;

    const textMsg = newMessage.trim();
    let finalMsg = textMsg;

    if (attachedProduct) {
      finalMsg = `[PRODUCT|${attachedProduct.id}|${attachedProduct.name}|${attachedProduct.image}|${attachedProduct.price}]:::${textMsg}`;
    }

    setNewMessage('');
    setAttachedProduct(null);
    setShowProductMenu(false);

    // Stop typing indicator on send
    if (typingChannelRef.current && selectedUser) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { role: 'ADMIN', isTyping: false }
      }).catch(console.warn);
    }

    // Optimistic UI update
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      sender_role: 'ADMIN',
      content: finalMsg,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);
    setSendError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_role: 'ADMIN',
          content: finalMsg,
          user_id: selectedUser.user_id.startsWith('anon-') ? undefined : selectedUser.user_id,
          user_name: selectedUser.user_name,
          product_id: selectedUser.user_id,
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        const errData = contentType && contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};
        throw new Error(errData.error || 'Gagal mengirim pesan');
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respons server tidak valid');
      }
      const { data } = await res.json();
      if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data : m))
        );
      }
      fetchConversations(false);
    } catch (e: any) {
      console.warn('Failed sending admin message:', e);
      setSendError(e.message || 'Gagal mengirim pesan');
      setNewMessage(textMsg);
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch('/api/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_chat', product_id: selectedUser.user_id }),
      });
      if (res.ok) {
        setMessages([]);
        fetchConversations(false);
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      }
    } catch (e) {
      console.warn('Failed clearing chat:', e);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = catalogProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Hide widget on Admin Dashboard full pages
  if (pathname === '/dashboard' || pathname === '/admin-panel/dashboard') {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all z-50 hover:scale-110 active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-slate-800 text-white hover:bg-slate-700'
            : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-pink-500/30'
        }`}
        aria-label={isOpen ? 'Tutup mini inbox' : 'Buka mini inbox admin'}
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-pink-400" />
            {totalUnread > 0 && (
              <span className="absolute -top-3.5 -right-3.5 min-w-[24px] h-[24px] bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1.5 animate-bounce border-2 border-white shadow-md">
                {totalUnread}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Main Admin Mini Inbox Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
            className={`fixed bg-white shadow-2xl z-50 flex flex-col overflow-hidden origin-bottom-right will-change-transform ${
              isExpanded
                ? 'inset-0 w-full h-full rounded-none border-0 sm:border sm:border-slate-200 sm:top-24 sm:bottom-24 sm:h-auto sm:right-6 sm:left-auto sm:w-[480px] lg:w-[45vw] sm:rounded-3xl'
                : 'bottom-24 right-6 w-[calc(100vw-48px)] sm:w-[400px] rounded-3xl border border-slate-200'
            }`}
            style={!isExpanded ? { height: '560px', maxHeight: '78vh' } : {}}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-pink-500/20 border border-pink-500/40 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm">Inbox</h3>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {selectedUser ? `Bertukar pesan dengan ${selectedUser.user_name}` : `${conversations.length} total percakapan`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!selectedUser && (
                  <button
                    onClick={() => fetchConversations(true)}
                    className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title="Refresh daftar pesan"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title={isExpanded ? 'Perkecil' : 'Perbesar'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4 text-slate-300" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* VIEW 1: CONVERSATION LIST (When no user selected) */}
            {!selectedUser ? (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60">
                {/* Search Box */}
                <div className="p-3 bg-white border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau isi pesan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {isLoading && conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-pink-500 rounded-full animate-spin" />
                      <p className="text-xs">Memuat daftar chat...</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <MessageSquare className="w-7 h-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">Belum ada chat masuk</p>
                      <p className="text-[11px] text-slate-400 mt-1">Pesan dari pelanggan Anda akan muncul di sini secara real-time.</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.user_id}
                        onClick={() => setSelectedUser(conv)}
                        className={`w-full p-3.5 flex items-start gap-3 hover:bg-pink-50/50 transition-colors text-left cursor-pointer ${
                          conv.unread > 0 ? 'bg-pink-50/70 border-l-4 border-l-pink-500' : 'bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getUserColor(conv.user_id)} flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm`}>
                          {conv.user_name ? conv.user_name.substring(0, 2).toUpperCase() : <User className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-slate-800 truncate">{conv.user_name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {conv.unread > 0 && (
                                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                                  {conv.unread}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-medium">
                                {formatTime(conv.last_message_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 mt-1">
                            {conv.last_sender === 'ADMIN' && (
                              <span className="text-[10px] font-extrabold text-pink-600 shrink-0">Anda: </span>
                            )}
                            <p className={`text-[11px] truncate ${conv.unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                              {conv.last_message}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* VIEW 2: ACTIVE CHAT ROOM (When selectedUser is clicked) */
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
                {/* Chat Header Bar */}
                <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
                      title="Kembali ke daftar pesan"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getUserColor(selectedUser.user_id)} flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm`}>
                      {selectedUser.user_name ? selectedUser.user_name.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{selectedUser.user_name}</h4>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Online
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                    title="Hapus riwayat obrolan ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoading && messages.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-pink-500 rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                      <p className="text-xs font-semibold">Belum ada riwayat pesan</p>
                      <p className="text-[10px] mt-0.5">Ketik pesan balasan di bawah</p>
                    </div>
                  ) : (
                    (() => {
                      let lastDateStr = '';
                      const todayStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      const yesterdayStr = yesterday.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

                      return messages.map((msg, idx) => {
                        const msgDate = new Date(msg.created_at);
                        const dateStr = msgDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                        
                        let displayDate = dateStr;
                        if (dateStr === todayStr) displayDate = 'Hari ini';
                        else if (dateStr === yesterdayStr) displayDate = 'Kemarin';

                        const showSeparator = dateStr !== lastDateStr;
                        lastDateStr = dateStr;

                        return (
                          <React.Fragment key={msg.id || idx}>
                            {showSeparator && (
                              <div className="flex justify-center my-3 w-full">
                                <span className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full shadow-sm">
                                  {displayDate}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex w-full gap-2 items-end ${
                                msg.sender_role === 'ADMIN' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div className={`flex flex-col ${msg.sender_role === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                <div
                                  className={`max-w-[240px] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.sender_role === 'ADMIN'
                                      ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-none'
                                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                  }`}
                                >
                          {msg.content.startsWith('[PRODUCT|') ? (
                            (() => {
                              const [prodStr, textStr] = msg.content.split(':::');
                              const parts = prodStr.split('|');
                              const pId = parts[1];
                              const pName = parts[2];
                              const pImg = parts[3];
                              const pPrice = parts[4]?.replace(']', '');
                              return (
                                <div className="flex flex-col gap-2">
                                  <a
                                    href={`/product/${pId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2.5 p-2 rounded-xl border hover:opacity-90 transition-opacity cursor-pointer ${
                                      msg.sender_role === 'ADMIN'
                                        ? 'bg-white/20 border-white/20 text-white'
                                        : 'bg-slate-50 border-slate-100 text-slate-800'
                                    }`}
                                  >
                                    {pImg && (
                                      <img
                                        src={pImg}
                                        alt={pName}
                                        className="w-10 h-10 rounded-lg object-cover bg-white shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-[11px] leading-tight mb-0.5 truncate">
                                        {pName || 'Produk'}
                                      </p>
                                      <p className="text-[10px] font-semibold opacity-90">
                                        Rp {Number(pPrice || 0).toLocaleString('id-ID')}
                                      </p>
                                    </div>
                                  </a>
                                  {textStr && <p className="text-xs break-words">{textStr}</p>}
                                </div>
                              );
                            })()
                          ) : (
                            <p className="break-words">{msg.content}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                          {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {msg.sender_role === 'ADMIN' && String(msg.id).startsWith('temp-') && (
                            <span className="font-bold inline-flex items-center">
                              <Clock className="w-3 h-3 text-slate-400 animate-pulse" />
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                          </React.Fragment>
                        );
                      });
                    })()
                  )}
                  
                  {isUserTyping && selectedUser && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-2 px-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex gap-1 bg-white border border-slate-200 shadow-sm px-3 py-2 rounded-2xl rounded-bl-sm">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>{selectedUser.user_name} sedang mengetik...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Attached Product Menu */}
                <div className="relative shrink-0">
                  {showProductMenu && (
                    <div className="absolute bottom-full left-3 mb-2 w-[calc(100%-24px)] bg-white border border-slate-200 rounded-2xl shadow-xl z-20 flex flex-col">
                      <div className="p-2 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="Cari boneka..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-400"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredProducts.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setAttachedProduct(p);
                              setShowProductMenu(false);
                              setProductSearch('');
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 cursor-pointer"
                          >
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[10px] text-pink-500 font-semibold">
                                Rp {Number(p.price).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {attachedProduct && (
                    <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100">
                      <div className="flex items-center gap-3 p-2 bg-pink-50 border border-pink-100 rounded-xl relative pr-8">
                        <img
                          src={attachedProduct.image}
                          alt={attachedProduct.name}
                          className="w-9 h-9 rounded-lg object-cover bg-white shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[11px] text-slate-800 truncate">
                            {attachedProduct.name}
                          </p>
                          <p className="text-[10px] font-semibold text-pink-500">
                            Rp {Number(attachedProduct.price).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedProduct(null)}
                          className="absolute top-2 right-2 p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 bg-white border-t border-slate-100 flex flex-col gap-1"
                  >
                    {sendError && (
                      <p className="text-[10px] text-red-500 font-semibold px-1">{sendError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowProductMenu(!showProductMenu)}
                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl transition-all shrink-0 cursor-pointer flex items-center justify-center"
                        title="Lampirkan Produk Katalog"
                      >
                        <Tag className="w-5 h-5" />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleTypingChange}
                        placeholder={
                          attachedProduct
                            ? 'Ketik pesan untuk produk ini...'
                            : `Balas ${selectedUser.user_name}...`
                        }
                        disabled={isSending}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-pink-400 focus:bg-white transition-all disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={(!newMessage.trim() && !attachedProduct) || isSending}
                        className="px-5 py-3 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 rounded-xl font-bold text-sm transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-2"
                      >
                        {isSending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete modal inside AdminMiniChatWidget */}
            {isDeleteModalOpen && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 rounded-3xl">
                <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-center font-bold text-slate-800 text-lg mb-2">Hapus Chat Ini?</h3>
                  <p className="text-center text-[11px] text-slate-500 mb-6">
                    Riwayat pesan dengan pengguna ini akan dihapus secara permanen.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleClearChat}
                      className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-red-500/30"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
