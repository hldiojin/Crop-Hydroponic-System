// src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Fade,
  Grid,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Message as MessageIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Chat from '../components/Chat';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [showChat, setShowChat] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleEditClick = () => setIsEditing(true);
  const handleChatToggle = () => setShowChat(!showChat);

  const handleSaveClick = async () => {
    try {
      await updateProfile(editData);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0}
            sx={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 150,
                bgcolor: 'primary.main',
                background: 'linear-gradient(120deg, #2e7d32 0%, #60ad5e 100%)',
              }}
            />
            <CardContent sx={{ position: 'relative', pt: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid white',
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    boxShadow: 3,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ ml: 3, flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {user?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    onClick={handleEditClick}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                    }}
                  >
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton
                    onClick={handleChatToggle}
                    sx={{
                      ml: 1,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                    }}
                  >
                    <MessageIcon color="primary" />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {isEditing ? (
                <Fade in={isEditing}>
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Name"
                      name="name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Email"
                      name="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      fullWidth
                      variant="outlined"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button 
                        onClick={() => setIsEditing(false)}
                        variant="outlined"
                        color="primary"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveClick}
                        variant="contained"
                        color="primary"
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              ) : (
                <Fade in={!isEditing}>
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Personal Information
                        </Typography>
                        <Card sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 3 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography color="text.secondary" gutterBottom>
                                Full Name
                              </Typography>
                              <Typography variant="h6">{user?.name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography color="text.secondary" gutterBottom>
                                Email Address
                              </Typography>
                              <Typography variant="h6">{user?.email}</Typography>
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in={showChat}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
              }}
            >
              <CardContent>
                <Chat />
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;