// src/components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Paper,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderId: number;
  senderName: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

const socket = io('http://localhost:3000');

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    socket.emit('joinChat', { userId: user?.id });

    socket.on('receiveMessage', (newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    });

    socket.on('userTyping', (typingStatus: boolean) => {
      setIsTyping(typingStatus);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Omit<Message, 'id'> = {
        text: message,
        senderId: user?.id || 0,
        senderName: user?.name || 'Anonymous',
        timestamp: new Date(),
        status: 'sent'
      };

      socket.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    socket.emit('typing', { userId: user?.id, isTyping: true });
    
    // Debounce typing indicator
    setTimeout(() => {
      socket.emit('typing', { userId: user?.id, isTyping: false });
    }, 1000);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">
          Chat with Admin
        </Typography>
        {loading && <CircularProgress size={20} sx={{ color: 'white' }} />}
      </Box>

      {/* Messages List */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        {messages.map((msg, index) => (
          <ListItem
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                bgcolor: msg.senderId === user?.id ? 'primary.main' : 'white',
                color: msg.senderId === user?.id ? 'white' : 'text.primary',
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {msg.senderName}
              </Typography>
              <Typography>{msg.text}</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5,
                  opacity: 0.8
                }}
              >
                {format(new Date(msg.timestamp), 'HH:mm')}
              </Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
        
        {isTyping && (
          <Fade in={true}>
            <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption">Someone is typing...</Typography>
            </Box>
          </Fade>
        )}
      </List>

      {/* Message Input */}
      <Box
        component="form"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={handleTyping}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          sx={{
            borderRadius: 2,
            px: 3
          }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default Chat;