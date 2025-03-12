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
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon,
  Cancel as CancelIcon,
  AddAPhoto as AddPhotoIcon, 
  Refresh as RefreshIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  VpnKey as PasswordIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, getUserInfo, loading, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const checkedCookiesRef = useRef(false);

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
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
        }
        
        await getUserInfo();
      } catch (error) {
        console.error('Error loading profile:', error);
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

  const handleEdit = () => setIsEditing(true);
  
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
      // Only include fields that have changed
      const updateData: Partial<typeof editData> = {};
      
      if (editData.name !== user?.name) {
        updateData.name = editData.name;
      }
      
      if (editData.phone !== user?.phone) {
        updateData.phone = editData.phone;
      }
      
      // Only update if something changed
      if (Object.keys(updateData).length === 0) {
        setSnackbar({
          open: true,
          message: 'No changes to save',
          severity: 'info',
        });
        setIsEditing(false);
        return;
      }
      
      await updateProfile(updateData);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update profile',
        severity: 'error',
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleRefreshProfile = async () => {
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
  };
  
  // Password change handlers
  const handlePasswordModalOpen = () => {
    setPasswordModalOpen(true);
  };

  const handlePasswordModalClose = () => {
    setPasswordModalOpen(false);
    // Reset form data and errors
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the specific error when typing
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    clearError();
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    const errors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    let isValid = true;
    
    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Current password is required';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };

  const handleSubmitPasswordChange = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await changePassword(passwordData);
      
      // Close the modal and show success message
      handlePasswordModalClose();
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error changing password:', err);
      // Error is already set in the context, but we can also show it in the snackbar
      if (err instanceof Error) {
        setSnackbar({
          open: true,
          message: err.message,
          severity: 'error'
        });
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loadingProfile ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 0, 
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header Section with Background */}
          <Box 
            sx={{ 
              height: 150, 
              background: 'linear-gradient(120deg, #2196F3, #21CBF3)',
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              p: 3
            }}
          >
           
            
            <Box>
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<CancelIcon />}
                    variant="contained"
                    color="error"
                    onClick={handleCancel}
                    disabled={loading}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={loading ? undefined : <SaveIcon />}
                    variant="contained"
                    color="success"
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
          
          {/* Avatar positioned to overlap the header and content */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              position: 'relative',
              mt: -6, // Adjusted for better positioning
              mb: 3,
              px: 3,
              textAlign: 'center'
            }}
          >
            <Box position="relative" display="inline-block">
              <Avatar
                src={avatarPreview || user?.attachment || undefined}
                alt={user?.name}
                sx={{ 
                  width: 120,
                  height: 120, 
                  border: '5px solid white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
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
                      right: 5,
                      bottom: 5,
                      backgroundColor: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                  >
                    <AddPhotoIcon />
                  </IconButton>
                </label>
              )}
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 2, width: '100%' }}>
              <Typography variant="h5" fontWeight="bold">
                {user?.name}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, gap: 1 }}>
                <Chip
                  icon={<BadgeIcon fontSize="small" />}
                  label={user?.role || "User"}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                
                {user?.status && (
                  <Chip
                    label={user.status}
                    color={user.status === 'Active' ? 'success' : 'warning'}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          {error && (
            <Box sx={{ px: 3, mb: 2 }}>
              <Alert severity="error" onClose={clearError}>
                {error}
              </Alert>
            </Box>
          )}
          
          <Divider />
          
          {/* User Information Form */}
          <Box sx={{ px: 4, py: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" gutterBottom>
                  Personal Information
                </Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={isEditing ? editData.name : user?.name || ''}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={isEditing ? editData.phone : user?.phone || ''}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Card>
              </Box>
              
              {/* Account Actions Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" gutterBottom>
                  Account Actions
                </Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefreshProfile}
                      disabled={loadingProfile}
                      sx={{ flex: { xs: '1 1 100%', sm: '1 1 0%' } }}
                    >
                      {loadingProfile ? <CircularProgress size={24} /> : 'Refresh Profile'}
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      color="secondary"
                      startIcon={<PasswordIcon />}
                      onClick={handlePasswordModalOpen}
                      sx={{ flex: { xs: '1 1 100%', sm: '1 1 0%' } }}
                    >
                      Change Password
                    </Button>
                  </Stack>
                </Card>
              </Box>
            </Stack>
          </Box>
        </Paper>
      )}
      
      {/* Password Change Modal */}
      <Modal
        open={passwordModalOpen}
        onClose={handlePasswordModalClose}
        aria-labelledby="change-password-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography id="change-password-modal" variant="h5" component="h2" gutterBottom>
            Change Password
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}
          
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="old-password">Current Password</InputLabel>
              <OutlinedInput
                id="old-password"
                name="oldPassword"
                type={showPasswords.oldPassword ? 'text' : 'password'}
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.oldPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('oldPassword')}
                      edge="end"
                    >
                      {showPasswords.oldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Current Password"
              />
              {passwordErrors.oldPassword && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 2 }}>
                  {passwordErrors.oldPassword}
                </Typography>
              )}
            </FormControl>
            
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="new-password">New Password</InputLabel>
              <OutlinedInput
                id="new-password"
                name="newPassword"
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('newPassword')}
                      edge="end"
                    >
                      {showPasswords.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="New Password"
              />
              {passwordErrors.newPassword && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 2 }}>
                  {passwordErrors.newPassword}
                </Typography>
              )}
            </FormControl>
            
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
              <OutlinedInput
                id="confirm-password"
                name="confirmPassword"
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirmPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      edge="end"
                    >
                      {showPasswords.confirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Confirm New Password"
              />
              {passwordErrors.confirmPassword && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 2 }}>
                  {passwordErrors.confirmPassword}
                </Typography>
              )}
            </FormControl>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePasswordModalClose}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitPasswordChange}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      
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