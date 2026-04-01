import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, User as UserIcon, MessageCircle, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';

export const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(() => {
    const saved = localStorage.getItem('lastChatContact');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedContact) {
      localStorage.setItem('lastChatContact', JSON.stringify(selectedContact));
    }
  }, [selectedContact]);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const [currentUser, setCurrentUser] = useState(() => {
    const str = localStorage.getItem('user');
    return str ? JSON.parse(str) : null;
  });
  const [isLoadingUser, setIsLoadingUser] = useState(!currentUser && !!token);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!currentUser && token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if(res.ok) return res.json();
        throw new Error('Not authorized');
      })
      .then(user => {
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
      })
      .catch((err) => {
        console.error("Failed to fetch user in Chat:", err);
      })
      .finally(() => setIsLoadingUser(false));
    }
  }, [currentUser, token]);

  useEffect(() => {
    if (!currentUserId) return;
    
    // Fetch user contacts
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/contacts/${currentUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(console.error);

    // Initialize WebSocket
    const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        client.subscribe(`/topic/messages/${currentUserId}`, (msg) => {
           const newMsg = JSON.parse(msg.body);
           setMessages(prev => {
             if (prev.some(m => m.id === newMsg.id && m.id !== undefined)) return prev;
             return [...prev, newMsg];
           });
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });
    
    client.activate();
    stompClient.current = client;

    return () => client.deactivate();
  }, [currentUserId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/${currentUserId}/${contact.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (location.state?.contact) {
      const contactFromProfile = location.state.contact;
      setContacts(prev => {
        if (!prev.find(c => c.id === contactFromProfile.id)) {
          return [contactFromProfile, ...prev];
        }
        return prev;
      });
      selectContact(contactFromProfile);
    } else if (selectedContact && currentUserId && messages.length === 0) {
      selectContact(selectedContact);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.contact, currentUserId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact || !stompClient.current) return;

    const chatMessage = {
      senderId: currentUserId,
      receiverId: selectedContact.id,
      content: inputMessage
    };

    stompClient.current.publish({
      destination: '/app/chat',
      body: JSON.stringify(chatMessage)
    });

    const optimisticMsg = { 
      id: "temp-" + Date.now(), 
      senderId: currentUserId, 
      receiverId: selectedContact.id, 
      content: inputMessage,
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setInputMessage('');
  };

  if (isLoadingUser) return <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium">Loading chat...</div>;
  if (!currentUser) return <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium">Please log in to use chat.</div>;

  // Render Mobile/Narrow Layout where it's either contacts list or chat view
  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-64px)] bg-[var(--color-bg-primary)]">
       {/* Sticky Top Header */}
       <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-border)] p-2 flex items-center justify-between cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="flex items-center gap-4">
          {selectedContact && (
            <button onClick={() => setSelectedContact(null)} className="p-2 sm:hidden rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-xl font-bold ml-2">Messages</h1>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Contacts Sidebar (Hidden on mobile if a contact is selected) */}
        <div className={`w-full sm:w-[250px] border-r border-[var(--color-border)] overflow-y-auto ${selectedContact ? 'hidden sm:block' : 'block'}`}>
          {contacts.length === 0 ? (
            <p className="p-8 text-center text-[var(--color-text-secondary)] text-sm">You need to follow someone or let them follow you to start a chat.</p>
          ) : (
            <ul className="flex flex-col">
              {contacts.map(c => (
                <li 
                  key={c.id} 
                  className={`flex items-center gap-3 p-4 border-b border-[var(--color-border)] cursor-pointer transition-colors ${selectedContact?.id === c.id ? 'bg-[var(--color-bg-tertiary)] border-r-4 border-r-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-secondary)]'}`}
                  onClick={() => selectContact(c)}
                >
                  <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex-shrink-0 bg-[var(--color-bg-tertiary)] overflow-hidden">
                    {c.profilePicture ? (
                      <img src={getImageUrl(c.profilePicture)} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[var(--color-text-secondary)]"><UserIcon size={20} /></div>
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="font-bold text-[15px] truncate text-[var(--color-text-primary)]">{c.name}</div>
                    <div className="text-[13px] text-[var(--color-text-secondary)] truncate">@{c.username}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat Main Area */}
        <div className={`flex flex-col flex-1 h-full max-h-[calc(100vh-64px)] relative ${!selectedContact ? 'hidden sm:flex' : 'flex'}`}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-primary)]/90 backdrop-blur-md sticky top-0 z-10 mx-[-2px]">
                 <div className="w-10 h-10 rounded-full border border-[var(--color-border)] flex-shrink-0 bg-[var(--color-bg-tertiary)] overflow-hidden">
                    {selectedContact.profilePicture ? (
                      <img src={getImageUrl(selectedContact.profilePicture)} alt={selectedContact.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[var(--color-text-secondary)]"><UserIcon size={20} /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-text-primary)] leading-tight">{selectedContact.name}</h3>
                    <span className="text-[13px] text-[var(--color-text-secondary)]">@{selectedContact.username}</span>
                  </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                {messages.map((m, idx) => {
                  const isMine = m.senderId === currentUserId;
                  return (
                    <div key={m.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-[var(--color-accent)] text-white rounded-tr-sm' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-tl-sm'}`}>
                        <div className="text-[15px] break-words">{m.content}</div>
                        <div className={`text-[11px] mt-1 text-right ${isMine ? 'text-blue-100' : 'text-[var(--color-text-secondary)]'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] mt-auto mb-16 xl:mb-0">
                <form className="flex items-center gap-2 bg-[var(--color-bg-secondary)] rounded-full px-4 py-1.5" onSubmit={sendMessage}>
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Start a new message" 
                    className="flex-1 bg-transparent border-none outline-none text-[15px] text-[var(--color-text-primary)] py-2"
                  />
                  <button 
                    type="submit" 
                    className={`p-2 rounded-full transition-colors ${inputMessage.trim() ? 'text-[var(--color-accent)] hover:bg-blue-500/10' : 'text-gray-400'}`}
                    disabled={!inputMessage.trim()}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-secondary)] p-8">
              <MessageCircle size={64} className="mb-4 opacity-20" />
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Select a message</h3>
              <p className="text-center max-w-xs">Choose from your existing conversations, start a new one, or just keep swimming.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
