import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, User as UserIcon, MessageCircle } from 'lucide-react';
import './Chat.css';

export const Chat = () => {
  const location = useLocation();
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
             // Avoid duplicates if we receive what we sent, though our backend only sends to receiver
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

  if (isLoadingUser) return <div className="chat-container auth-msg">Loading chat...</div>;
  if (!currentUser) return <div className="chat-container auth-msg">Please log in to use chat.</div>;

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2 className="sidebar-title">Contacts</h2>
        {contacts.length === 0 ? (
          <p className="no-contacts">You need to follow someone or let them follow you to start a chat.</p>
        ) : (
          <ul className="contacts-list">
            {contacts.map(c => (
              <li 
                key={c.id} 
                className={`contact-item ${selectedContact?.id === c.id ? 'active' : ''}`}
                onClick={() => selectContact(c)}
              >
                {c.profilePicture ? (
                  <img src={c.profilePicture} alt={c.name} className="contact-avatar" />
                ) : (
                  <div className="contact-avatar-placeholder"><UserIcon size={16} /></div>
                )}
                <div className="contact-info">
                  <span className="contact-name">{c.name}</span>
                  <span className="contact-username">@{c.username}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="chat-main">
        {selectedContact ? (
          <>
            <div className="chat-header">
              {selectedContact.profilePicture ? (
                <img src={selectedContact.profilePicture} alt={selectedContact.name} className="contact-avatar" />
              ) : (
                <div className="contact-avatar-placeholder"><UserIcon size={16} /></div>
              )}
              <div className="chat-header-info">
                <h3>{selectedContact.name}</h3>
                <span>@{selectedContact.username}</span>
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((m, idx) => {
                const isMine = m.senderId === currentUserId;
                return (
                  <div key={m.id || idx} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                    <div className="message-content">{m.content}</div>
                    <div className="message-time">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={sendMessage}>
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..." 
                className="chat-input"
              />
              <button type="submit" className="chat-send-btn">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <MessageCircle size={48} />
            <h3>Your Messages</h3>
            <p>Select a contact to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};
