// src/pages/ProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  IconButton as MuiIconButton,
  CircularProgress,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Message as MessageIcon, 
  AddAPhoto as AddPhotoIcon, 
  Report as ReportIcon,
  Visibility,
  VisibilityOff,
  VpnKey as PasswordIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ReportTicketForm from '../components/ReportTicketForm';
import Cookies from 'js-cookie';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, getUserInfo, loading, error, clearError } = useAuth();
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
  const [loadingProfile, setLoadingProfile] = useState(false);
  

  const checkedCookiesRef = useRef(false);

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      // Only run this once
      if (checkedCookiesRef.current) return;
      checkedCookiesRef.current = true;
      
      setLoadingProfile(true);
      
      try {
        // Check if cookies exist
        const deviceId = Cookies.get('DeviceId');
        const refreshToken = Cookies.get('RefreshToken');
        
        console.log('ProfilePage - Cookies before loading:', {
          DeviceId: deviceId || 'missing',
          RefreshToken: refreshToken || 'missing'
        });
        
        if (!deviceId || !refreshToken) {
          console.warn('Cookies missing, might need to log in again');
          // You could redirect to login here if needed
        }
        
        // Get user info from the API
        await getUserInfo();
      } catch (error) {
        console.error('Error loading profile:', error);
        // Handle error appropriately
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserInfo();
  }, [getUserInfo]);
  
  // Update edit data when user data changes
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };
  
  const handleSave = async () => {
    try {
      await updateProfile({
        name: editData.name,
        phone: editData.phone,
        // email is typically not updated directly
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      
      setIsEditing(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: typeof err === 'string' ? err : 'Failed to update profile',
        severity: 'error',
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Add Avatar handling logic

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loadingProfile ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              My Profile
            </Typography>
            {!isEditing && (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                color="primary"
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  src={avatarPreview || user?.attachment || undefined}
                  alt={user?.name}
                  sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}
                />
                {isEditing && (
                  <label htmlFor="avatar-upload">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        right: -8,
                        bottom: 8,
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                    >
                      <AddPhotoIcon />
                    </IconButton>
                  </label>
                )}
              </Box>
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.role}
              </Typography>
              {user?.status && (
                <Typography
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    px: 1,
                    borderRadius: 1,
                    bgcolor: user.status === 'Active' ? 'success.light' : 'warning.light',
                    color: user.status === 'Active' ? 'success.contrastText' : 'warning.contrastText',
                  }}
                >
                  {user.status}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={isEditing ? editData.name : user?.name || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  variant={isEditing ? "outlined" : "filled"}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={isEditing ? editData.email : user?.email || ''}
                  onChange={handleChange}
                  disabled={true} // Email cannot be changed
                  variant="filled"
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={isEditing ? editData.phone : user?.phone || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  variant={isEditing ? "outlined" : "filled"}
                  margin="normal"
                />
                
                {/* Additional user information fields can be added here */}
              </Box>
              
              {isEditing && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              )}
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={async () => {
                  try {
                    setLoadingProfile(true);
                    
                    // Verify cookies before refresh
                    const deviceId = Cookies.get('DeviceId');
                    const refreshToken = Cookies.get('RefreshToken');
                    
                    console.log('Cookies before refresh:', {
                      DeviceId: deviceId || 'missing',
                      RefreshToken: refreshToken || 'missing'
                    });
                    
                    await getUserInfo();
                    
                    setSnackbar({
                      open: true,
                      message: 'Profile refreshed successfully',
                      severity: 'success'
                    });
                  } catch (error) {
                    console.error('Error refreshing profile:', error);
                    setSnackbar({
                      open: true,
                      message: 'Failed to refresh profile',
                      severity: 'error'
                    });
                  } finally {
                    setLoadingProfile(false);
                  }
                }}
                disabled={loadingProfile}
              >
                Refresh Profile
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;