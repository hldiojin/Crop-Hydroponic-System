// src/pages/ProfilePage.tsx
import React, { useState, useRef } from 'react';
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
  Modal,
} from '@mui/material';
import { Edit as EditIcon, Message as MessageIcon, AddAPhoto as AddPhotoIcon, Report as ReportIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ReportTicketForm from '../components/ReportTicketForm';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [showChat, setShowChat] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openModal, setOpenModal] = useState(false);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please select an image file',
          severity: 'error'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size should be less than 5MB',
          severity: 'error'
        });
        return;
      }

      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('File reading error:', error);
        setSnackbar({
          open: true,
          message: 'Error processing image',
          severity: 'error'
        });
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

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

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

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
                <Box sx={{ position: 'relative' }}>
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
                  </Avatar>
                  
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'background.paper' },
                    }}
                  >
                    <AddPhotoIcon color="primary" />
                  </IconButton>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </Box>
                <Box sx={{ ml: 3, flex: 1 }}>
                  <Typography
                    variant="h4"
                    fontWeight="bold" 
                    sx={{ mb: -1 }}
                  >
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
                  {user?.role !== 'admin' && (
                    <IconButton
                      onClick={handleOpenModal}
                      sx={{
                        ml: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.1)' },
                        transition: 'transform 0.2s',
                      }}
                    >
                      <ReportIcon color="primary" />
                    </IconButton>
                  )}
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
                    <TextField
                      label="Phone"
                      name="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Address"
                      name="address"
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
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
                            <Grid item xs={12} sm={6}>
                              <Typography color="text.secondary" gutterBottom>
                                Phone Number
                              </Typography>
                              <Typography variant="h6">{user?.phone || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography color="text.secondary" gutterBottom>
                                Address
                              </Typography>
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

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="report-ticket-modal"
        aria-describedby="report-ticket-form"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <ReportTicketForm />
        </Box>
      </Modal>
    </Container>
  );
};

export default ProfilePage;