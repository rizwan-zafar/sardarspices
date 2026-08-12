"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import Modal from "@/components/common/Modal";
import { useToast } from "@/components/common/ToastContext";
import { formatDateTime } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const { showToast } = useToast();

  const loadMessages = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?filter=${filter}` : "";
      const res = await fetch(`/api/contact${params}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openMessage = async (message) => {
    setSelected(message);
    if (!message.isRead) {
      try {
        await fetch(`/api/contact/${message.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)));
      } catch {
        // non-critical
      }
    }
  };

  const toggleRead = async (message) => {
    try {
      await fetch(`/api/contact/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !message.isRead }),
      });
      loadMessages();
    } catch {
      showToast("Could not update message", "error");
    }
  };

  const handleDelete = async (message) => {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch(`/api/contact/${message.id}`, { method: "DELETE" });
      showToast("Message deleted");
      setSelected(null);
      loadMessages();
    } catch {
      showToast("Could not delete message", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Contact Messages</h1>
          <p className="text-stone-500">Messages submitted through the contact form</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-400"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <EmptyState icon="✉️" title="No messages" description="Contact form submissions will appear here." />
      ) : (
        <div className="rounded-2xl bg-white border border-stone-200 divide-y divide-stone-100">
          {messages.map((message) => (
            <button
              key={message.id}
              onClick={() => openMessage(message)}
              className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors"
            >
              <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${message.isRead ? "bg-stone-200" : "bg-brand-500"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className={`truncate ${message.isRead ? "font-medium text-stone-600" : "font-semibold text-stone-900"}`}>
                    {message.name}
                    {message.subject && <span className="text-stone-400 font-normal"> — {message.subject}</span>}
                  </p>
                  <span className="text-xs text-stone-400 whitespace-nowrap">{formatDateTime(message.createdAt)}</span>
                </div>
                <p className="text-sm text-stone-500 truncate">{message.message}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Message Details">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-400 text-xs">Name</p>
                <p className="text-stone-700 font-medium">{selected.name}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs">Email</p>
                <p className="text-stone-700 font-medium">{selected.email}</p>
              </div>
              {selected.phone && (
                <div>
                  <p className="text-stone-400 text-xs">Phone</p>
                  <p className="text-stone-700 font-medium">{selected.phone}</p>
                </div>
              )}
              <div>
                <p className="text-stone-400 text-xs">Received</p>
                <p className="text-stone-700 font-medium">{formatDateTime(selected.createdAt)}</p>
              </div>
            </div>
            {selected.subject && (
              <div>
                <p className="text-stone-400 text-xs">Subject</p>
                <p className="text-stone-700 font-medium">{selected.subject}</p>
              </div>
            )}
            <div>
              <p className="text-stone-400 text-xs mb-1">Message</p>
              <p className="text-stone-700 whitespace-pre-line">{selected.message}</p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                onClick={() => toggleRead(selected)}
                className="text-sm font-medium text-brand-600 hover:text-brand-800"
              >
                Mark as {selected.isRead ? "Unread" : "Read"}
              </button>
              <button
                onClick={() => handleDelete(selected)}
                className="text-sm font-medium text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
