// src/pages/AdminDashboard.tsx
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Divider,
  TextField,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

type TicketFilter = 'all' | 'pending' | 'in-progress' | 'resolved';

const AdminDashboard: React.FC = () => {
  const { tickets, updateTicketStatus, isAdmin } = useAuth();
  const [filter, setFilter] = useState<TicketFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isAdmin) {
    return <Typography>Access Denied</Typography>;
  }

  const filteredTickets = tickets.filter(ticket => 
    (filter === 'all' ? true : ticket.status === filter) &&
    (ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ticket.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'in-progress': return '#2196f3';
      case 'resolved': return '#4caf50';
      default: return '#757575';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Ticket Management
        </Typography>
        <Tabs
          value={filter}
          onChange={(_, newValue) => setFilter(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="All Tickets" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="In Progress" value="in-progress" />
          <Tab label="Resolved" value="resolved" />
        </Tabs>
        <TextField
          fullWidth
          label="Search Tickets"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredTickets.map((ticket) => (
          <Grid item xs={12} key={ticket.id}>
            <Card 
              sx={{ 
                borderLeft: 6,
                borderColor: getStatusColor(ticket.status),
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {ticket.issueType}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      From: {ticket.userName} ({ticket.email})
                    </Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={ticket.status}
                      label="Status"
                      onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                      sx={{
                        backgroundColor: getStatusColor(ticket.status) + '20',
                      }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {ticket.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Ticket ID: {ticket.id}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(ticket.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(ticket.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;