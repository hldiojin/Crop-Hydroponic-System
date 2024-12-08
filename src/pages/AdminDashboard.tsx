// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Badge,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Inventory,
  AttachMoney,
  LocalFlorist,
  Settings,
  Science,
  Edit,
  Delete,
  MailOutline,
} from '@mui/icons-material';
import Chat from '../components/Chat';
import { Ticket } from '../types/types';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketAnchorEl, setTicketAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    socket.on('newTicket', (ticket: Ticket) => {
      setTickets((prevTickets) => [...prevTickets, ticket]);
    });

    return () => {
      socket.off('newTicket');
    };
  }, []);

  const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pt: 12, pb: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Sales</Typography>
                    <Typography variant="h4">$23,678</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AttachMoney />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+15% from last month</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#2196f3', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Users</Typography>
                    <Typography variant="h4">1,254</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <People />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+7% new users</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Products</Typography>
                    <Typography variant="h4">345</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Inventory />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+12 this week</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#f44336', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Orders</Typography>
                    <Typography variant="h4">789</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <LocalFlorist />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+23 today</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tickets Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Support Tickets
                  {tickets.filter(t => t.status === 'open').length > 0 && (
                    <Badge
                      color="error"
                      badgeContent={tickets.filter(t => t.status === 'open').length}
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
              </Box>
              <List>
                {tickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <ListItem
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: ticket.status === 'open' ? 'error.main' : 'primary.main' }}>
                          <MailOutline />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {ticket.subject}
                            <Chip
                              size="small"
                              label={ticket.status}
                              color={
                                ticket.status === 'open' 
                                  ? 'error' 
                                  : ticket.status === 'in-progress' 
                                    ? 'warning' 
                                    : 'success'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              From: {ticket.userName} | 
                            </Typography>
                            <Typography 
                              variant="body2" 
                              component="span" 
                              sx={{ ml: 1 }}
                            >
                              {new Date(ticket.createdAt).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      <IconButton
                        onClick={(e) => {
                          setSelectedTicket(ticket);
                          setTicketAnchorEl(e.currentTarget);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <List>
                {[1, 2, 3, 4, 5].map((item) => (
                  <React.Fragment key={item}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'grey.50',
                        },
                      }}
                      secondaryAction={
                        <Box>
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Science />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Order #${1000 + item}`}
                        secondary={`$${Math.floor(Math.random() * 1000)}.00 - Status: Processing`}
                      />
                    </ListItem>
                    {item < 5 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Product Categories */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Product Categories
              </Typography>
              <Box sx={{ mt: 3 }}>
                {[
                  { name: 'Plants', value: 35, color: '#4caf50' },
                  { name: 'Systems', value: 25, color: '#2196f3' },
                  { name: 'Nutrients', value: 40, color: '#ff9800' },
                ].map((category) => (
                  <Box key={category.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{category.name}</Typography>
                      <Typography variant="body2">{category.value}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={category.value}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: category.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Status Change Menu */}
        <Menu
          anchorEl={ticketAnchorEl}
          open={Boolean(ticketAnchorEl)}
          onClose={() => {
            setTicketAnchorEl(null);
            setSelectedTicket(null);
          }}
        >
          <MenuItem
            onClick={() => {
              if (selectedTicket) {
                handleStatusChange(selectedTicket.id, 'open');
              }
              setTicketAnchorEl(null);
            }}
          >
            Mark as Open
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedTicket) {
                handleStatusChange(selectedTicket.id, 'in-progress');
              }
              setTicketAnchorEl(null);
            }}
          >
            Mark as In Progress
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedTicket) {
                handleStatusChange(selectedTicket.id, 'resolved');
              }
              setTicketAnchorEl(null);
            }}
          >
            Mark as Resolved
          </MenuItem>
        </Menu>

        <Box sx={{ mt: 4 }}>
          <Chat />
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboard;