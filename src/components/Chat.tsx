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
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  Send as SendIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
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

const socket = io('http://localhost:3001');

const MessageBubble: React.FC<{ message: Message; isOwnMessage: boolean }> = ({ message, isOwnMessage }) => (
  <Zoom in={true} style={{ transitionDelay: '100ms' }}>
    <Box
      sx={{
        maxWidth: '70%',
        bgcolor: isOwnMessage ? 'primary.main' : 'white',
        color: isOwnMessage ? 'white' : 'text.primary',
        p: 2,
        borderRadius: isOwnMessage ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
        boxShadow: 2,
        position: 'relative',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
        {message.senderName}
      </Typography>
      <Typography sx={{ wordBreak: 'break-word' }}>{message.text}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5 }}>
        <Tooltip title={format(new Date(message.timestamp), 'PPpp')}>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
              mr: 0.5,
            }}
          >
            {format(new Date(message.timestamp), 'HH:mm')}
          </Typography>
        </Tooltip>
        {isOwnMessage && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {message.status === 'sent' && <DoneIcon sx={{ fontSize: 14, opacity: 0.8 }} />}
            {message.status === 'delivered' && <DoneAllIcon sx={{ fontSize: 14, opacity: 0.8 }} />}
            {message.status === 'read' && <DoneAllIcon sx={{ fontSize: 14, color: '#81c784' }} />}
          </Box>
        )}
      </Box>
    </Box>
  </Zoom>
);

const TypingIndicator: React.FC = () => (
  <Fade in={true}>
    <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          bgcolor: 'white',
          p: 1.5,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <CircularProgress
            key={i}
            size={8}
            sx={{
              animation: 'bounce 1.4s infinite ease-in-out',
              animationDelay: `${i * 0.16}s`,
              '@keyframes bounce': {
                '0%, 80%, 100%': { transform: 'scale(0)' },
                '40%': { transform: 'scale(1)' },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  </Fade>
);

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
    if (!user) return;

    setLoading(true);
    socket.emit('join', { userId: user.id, userName: user.name });

    const handleReceiveMessage = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleUserTyping = (typing: boolean) => {
      setIsTyping(typing);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);

    setLoading(false);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: `${Date.now()}`,
      text: message,
      senderId: user!.id,
      senderName: user!.name,
      timestamp: new Date(),
      status: 'sent',
    };

    socket.emit('sendMessage', newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    socket.emit('typing', e.target.value.length > 0);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px',
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Chat with Admin
        </Typography>
        {loading && <CircularProgress size={20} sx={{ color: 'white' }} />}
      </Box>

      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.map((msg, index) => (
          <ListItem
            key={msg.id || index}
            sx={{
              display: 'flex',
              justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
              p: 0.5,
            }}
          >
            <MessageBubble message={msg} isOwnMessage={msg.senderId === user?.id} />
          </ListItem>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </List>

      <Box
        component="form"
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
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
              backgroundColor: '#f8f9fa',
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={!message.trim()}
          sx={{
            borderRadius: 3,
            px: 3,
            textTransform: 'none',
          }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default Chat;