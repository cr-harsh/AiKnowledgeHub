import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { chatService } from '../services/documentService';

const CHAT_ACTIONS = [
  { mode: 'ask', label: 'Ask', icon: '💬', needsInput: true },
  { mode: 'summarize', label: 'Summarize', icon: '📋', needsInput: false },
  { mode: 'explain', label: 'Explain', icon: '🎓', needsInput: false },
  { mode: 'key_points', label: 'Key Points', icon: '⭐', needsInput: false },
  { mode: 'interview_questions', label: 'Interview Qs', icon: '🎯', needsInput: false }
];

const MODE_LABELS = {
  ask: 'Question',
  summarize: 'Summary',
  explain: 'Explanation',
  key_points: 'Key Points',
  interview_questions: 'Interview Questions'
};

const ChatMessage = ({ chat }) => {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className="space-y-3 animate-fade-in">
      {chat.mode === 'ask' && chat.question && (
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-[#82aeb1]/15 border border-[#82aeb1]/30 rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm text-[#d9f3f5]">{chat.question}</p>
          </div>
        </div>
      )}

      {chat.mode !== 'ask' && (
        <div className="flex justify-end">
          <div className="bg-[var(--bg-card)]/60 border border-[#82aeb1]/15 rounded-2xl rounded-tr-sm px-4 py-2">
            <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
              {MODE_LABELS[chat.mode]}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-start">
        <div className="max-w-[90%] bg-[var(--bg-card)]/80 border border-[#82aeb1]/15 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{chat.answer}</p>

          {chat.sourceChunks?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#82aeb1]/15">
              <button
                onClick={() => setShowSources(!showSources)}
                className="text-xs text-[#93c6d6] hover:text-[#a7acd9] font-semibold cursor-pointer"
              >
                {showSources ? 'Hide' : 'Show'} {chat.sourceChunks.length} source chunks
              </button>
              {showSources && (
                <div className="mt-2 space-y-2">
                  {chat.sourceChunks.map((chunk, i) => (
                    <div key={i} className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-main)]/70 rounded-lg p-2 border border-[#82aeb1]/15 line-clamp-3">
                      {chunk}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { documentId } = useParams();
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  const [document, setDocument] = useState(null);
  const [chats, setChats] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const response = await chatService.getHistory(documentId);
        if (response.data.success) {
          setChats(response.data.data.chats);
          setDocument(response.data.data.document);
        }
      } catch (err) {
        addToast('Failed to load chat', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadChat();
  }, [documentId, addToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const sendMessage = async (mode, customQuestion = '') => {
    if (mode === 'ask' && !customQuestion.trim()) {
      addToast('Please enter a question', 'error');
      return;
    }

    if (document?.status !== 'Ready') {
      addToast('Document is still processing', 'error');
      return;
    }

    setSending(true);
    try {
      const response = await chatService.send(documentId, customQuestion, mode);
      if (response.data.success) {
        setChats((prev) => [...prev, response.data.data.chat]);
        if (mode === 'ask') setQuestion('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Chat request failed', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage('ask', question);
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all chat history for this document?')) return;
    try {
      await chatService.clear(documentId);
      setChats([]);
      addToast('Chat history cleared', 'success');
    } catch (err) {
      addToast('Failed to clear chat', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#82aeb1]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="border-b border-[#82aeb1]/15 px-6 py-4 flex items-center justify-between shrink-0 bg-[var(--bg-main)]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/dashboard"
              className="text-[var(--text-tertiary)] hover:text-[#93c6d6] transition shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white truncate">
                {loading ? 'Loading...' : document?.title || 'Document Chat'}
              </h1>
              {document?.summary && (
                <p className="text-xs text-[var(--text-tertiary)] truncate max-w-xl">{document.summary}</p>
              )}
            </div>
          </div>

          {chats.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-[var(--danger-text)] hover:text-[var(--danger-text-hover)] border border-[var(--danger-border)] hover:border-[var(--danger-border-hover)] px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
            >
              Clear History
            </button>
          )}
        </div>

        <div className="px-6 py-3 border-b border-[#82aeb1]/10 flex gap-2 overflow-x-auto shrink-0">
          {CHAT_ACTIONS.filter((a) => !a.needsInput).map((action) => (
            <button
              key={action.mode}
              onClick={() => sendMessage(action.mode)}
              disabled={sending || document?.status !== 'Ready'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)]/60 hover:bg-[#82aeb1]/15 border border-[#82aeb1]/15 hover:border-[#82aeb1]/35 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[#93c6d6] transition whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-[#82aeb1]/30 border-t-[#93c6d6] rounded-full animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#82aeb1]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#82aeb1]/20">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Start a Conversation</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm mx-auto">
                Ask questions or use the quick actions above to summarize, explain, or generate interview questions.
              </p>
            </div>
          ) : (
            chats.map((chat) => <ChatMessage key={chat._id} chat={chat} />)
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-card)]/80 border border-[#82aeb1]/15 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#82aeb1]/30 border-t-[#93c6d6] rounded-full animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-[#82aeb1]/15 px-6 py-4 shrink-0 bg-[var(--bg-main)]/80 backdrop-blur-md">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this document..."
              disabled={sending || document?.status !== 'Ready'}
              className="flex-1 bg-[var(--bg-card)]/55 border border-[#82aeb1]/15 focus:border-[#82aeb1] text-white placeholder:text-[var(--text-quaternary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#82aeb1]/40 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !question.trim() || document?.status !== 'Ready'}
              className="px-6 py-3 bg-gradient-to-r from-[#668586] via-[#82aeb1] to-[#93c6d6] hover:from-[#82aeb1] hover:to-[#a7acd9] text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-[#82aeb1]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Chat;
