import React, { useState, useRef, useEffect } from "react";
import {
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  Divider,
  Modal,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  Stack,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
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
  VpnKey as PasswordIcon,
  Help as HelpIcon,
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import ticketService from "../services/ticketService";
import { Ticket, TicketRequest } from "../types/types";
import { motion } from "framer-motion";
import {
  MotionBox,
  MotionAvatar,
  MotionTypography,
  MotionTextField,
  MotionButton,
  containerVariants,
  itemVariants,
  logoVariants,
  buttonVariants
} from "../utils/motion";

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    user,
    updateProfile,
    changePassword,
    getUserInfo,
    loading,
    error,
    clearError,
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Ticket state
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState<TicketRequest>({
    Type: "Shopping",
    Description: "",
  });
  const [ticketAttachments, setTicketAttachments] = useState<File[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketPage, setTicketPage] = useState(1);
  const [totalTicketPages, setTotalTicketPages] = useState(1);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsDialogOpen, setTicketsDialogOpen] = useState(false);

  const checkedCookiesRef = useRef(false);

  // Section visibility state for animation
  const [activeSection, setActiveSection] = useState("profile");

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (checkedCookiesRef.current) return;
      checkedCookiesRef.current = true;

      setLoadingProfile(true);

      try {
        // Check if cookies exist
        const deviceId = Cookies.get("DeviceId");
        const refreshToken = Cookies.get("RefreshToken");

        if (!deviceId || !refreshToken) {
          console.warn("Cookies missing, might need to log in again");
        }

        await getUserInfo();
      } catch (error) {
        console.error("Error loading profile:", error);
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
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
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
          message: "No changes to save",
          severity: "info",
        });
        setIsEditing(false);
        return;
      }

      await updateProfile(updateData);

      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setSnackbar({
        open: true,
        message:
          err instanceof Error ? err.message : "Failed to update profile",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRefreshProfile = async () => {
    try {
      setLoadingProfile(true);
      await getUserInfo();
      setSnackbar({
        open: true,
        message: "Profile refreshed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setSnackbar({
        open: true,
        message: "Failed to refresh profile",
        severity: "error",
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
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the specific error when typing
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error
    clearError();
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswordForm = () => {
    const errors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
        message: "Password changed successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      if (err instanceof Error) {
        setSnackbar({
          open: true,
          message: err.message,
          severity: "error",
        });
      }
    }
  };

  // Ticket handlers
  const handleTicketModalOpen = () => {
    setTicketModalOpen(true);
  };

  const handleTicketModalClose = () => {
    setTicketModalOpen(false);
    setTicketData({
      Type: "Shopping",
      Description: "",
    });
    setTicketAttachments([]);
    setTicketError(null);
  };

  const handleTicketTypeChange = (
    e: SelectChangeEvent<"Shopping" | "Technical">
  ) => {
    setTicketData((prev: any) => ({
      ...prev,
      Type: e.target.value as "Shopping" | "Technical",
    }));
  };

  const handleTicketDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTicketData((prev: any) => ({
      ...prev,
      Description: e.target.value,
    }));
  };

  const handleTicketAttachmentsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setTicketAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmitTicket = async () => {
    if (!ticketData.Description.trim()) {
      setTicketError("Please provide a description");
      return;
    }

    try {
      setTicketLoading(true);
      setTicketError(null);

      // Submit ticket with separate attachments
      await ticketService.createTicket(ticketData, ticketAttachments);

      handleTicketModalClose();
      setSnackbar({
        open: true,
        message: "Ticket submitted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setTicketError(
        error instanceof Error ? error.message : "Failed to submit ticket"
      );
    } finally {
      setTicketLoading(false);
    }
  };

  const handleViewAllTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const response = await ticketService.getAllTickets(ticketPage);
      setTickets(response.response.data);
      setTotalTicketPages(response.response.totalPages);
      setTicketsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setSnackbar({
        open: true,
        message: "Failed to load tickets",
        severity: "error",
      });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleLoadMoreTickets = async () => {
    if (ticketPage < totalTicketPages) {
      setIsLoadingTickets(true);
      try {
        const nextPage = ticketPage + 1;
        const response = await ticketService.getAllTickets(nextPage);
        setTickets((prev: Ticket[]) => [...prev, ...response.response.data]);
        setTicketPage(nextPage);
        setTotalTicketPages(response.response.totalPages);
      } catch (error) {
        console.error("Error fetching more tickets:", error);
        setSnackbar({
          open: true,
          message: "Failed to load more tickets",
          severity: "error",
        });
      } finally {
        setIsLoadingTickets(false);
      }
    }
  };

  const handleCloseTicketsDialog = () => {
    setTicketsDialogOpen(false);
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ 
        width: '100vw', 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f9f9f9, #e8f5e9)',
        overflow: 'auto',
        paddingTop: '24px' // Add padding to top to clear navbar space
      }}
    >
      {loadingProfile ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            width: '100%',
            minHeight: 'calc(100vh - 24px)', // Adjust height to account for top padding
            p: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            mt: { xs: 5, sm: 2 } // Added top margin to move content down, away from navbar
          }}
        >
          {/* Header with back button and title */}
          <MotionBox
            variants={itemVariants}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              pt: { xs: 2, sm: 0 } // Add padding top on mobile for better spacing
            }}
          >
            <IconButton 
              color="primary" 
              onClick={() => navigate('/')}
              sx={{ 
                bgcolor: 'rgba(46, 125, 50, 0.1)',
                '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.2)' },
                boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <MotionTypography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              color="primary"
              sx={{ 
                textAlign: 'center', 
                flex: 1,
                fontSize: { xs: '1.75rem', sm: '2.125rem' } // Responsive font size
              }}
            >
              My Profile
            </MotionTypography>
            
            {/* Just a dummy element to center the title */}
            <Box sx={{ width: 40 }} />
          </MotionBox>

          {/* Main content area */}
          <MotionBox
            variants={containerVariants}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              flex: 1
            }}
          >
            {/* Left sidebar with avatar and quick actions */}
            <MotionBox
              variants={itemVariants}
              sx={{
                width: { xs: '100%', md: '280px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Card
                elevation={4}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  width: '100%',
                  textAlign: 'center',
                  background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }}
              >
                <Box position="relative" display="inline-block" mb={2}>
                  <MotionAvatar
                    variants={logoVariants}
                    src={avatarPreview || user?.attachment || undefined}
                    alt={user?.name}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
                      margin: '0 auto'
                    }}
                  />
                  {isEditing && (
                    <label htmlFor="avatar-upload">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        style={{ display: "none" }}
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
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          backgroundColor: "white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                      >
                        <AddPhotoIcon />
                      </IconButton>
                    </label>
                  )}
                </Box>

                <MotionTypography 
                  variant="h5" 
                  component="h2" 
                  fontWeight="bold"
                  color="primary.dark"
                  gutterBottom
                  variants={itemVariants}
                >
                  {user?.name}
                </MotionTypography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 2
                  }}
                >
                  <Chip
                    icon={<BadgeIcon fontSize="small" />}
                    label={user?.role || "User"}
                    color="primary"
                    size="small"
                  />

                  {user?.status && (
                    <Chip
                      label={user.status}
                      color={user.status === "Active" ? "success" : "warning"}
                      size="small"
                    />
                  )}
                </Box>

                {/* Action buttons */}
                <Stack spacing={2} mt={2}>
                  {!isEditing ? (
                    <MotionButton
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      startIcon={<EditIcon />}
                      variant="contained"
                      color="primary"
                      onClick={handleEdit}
                      fullWidth
                    >
                      Edit Profile
                    </MotionButton>
                  ) : (
                    <>
                      <MotionButton
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        startIcon={loading ? undefined : <SaveIcon />}
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                        disabled={loading}
                        fullWidth
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Save Changes"
                        )}
                      </MotionButton>
                      <MotionButton
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        startIcon={<CancelIcon />}
                        variant="outlined"
                        color="error"
                        onClick={handleCancel}
                        disabled={loading}
                        fullWidth
                      >
                        Cancel
                      </MotionButton>
                    </>
                  )}
                  
                  <MotionButton
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    startIcon={<DashboardIcon />}
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/')}
                    fullWidth
                  >
                    Go to Dashboard
                  </MotionButton>
                </Stack>
              </Card>

              {/* Quick actions card */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  width: '100%',
                  background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                }}
              >
                <MotionTypography 
                  variant="h6" 
                  component="h3" 
                  fontWeight="bold"
                  color="primary.dark"
                  gutterBottom
                  variants={itemVariants}
                >
                  Quick Actions
                </MotionTypography>

                <Stack spacing={2} mt={2}>
                  <MotionButton
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    startIcon={<PasswordIcon />}
                    variant="outlined"
                    onClick={handlePasswordModalOpen}
                    fullWidth
                  >
                    Change Password
                  </MotionButton>

                  <MotionButton
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    onClick={handleRefreshProfile}
                    disabled={loadingProfile}
                    fullWidth
                  >
                    {loadingProfile ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Refresh Profile"
                    )}
                  </MotionButton>
                </Stack>
              </Card>
            </MotionBox>

            {/* Right side with personal info and ticket sections */}
            <MotionBox
              variants={itemVariants}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              {/* Personal Information Card */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: 'linear-gradient(120deg, #2e7d32, #60ad5e)',
                    color: 'white'
                  }}
                >
                  <MotionTypography 
                    variant="h6" 
                    fontWeight="bold"
                    variants={itemVariants}
                  >
                    Personal Information
                  </MotionTypography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  {error && (
                    <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                
                  <Stack spacing={3}>
                    <MotionTextField
                      variants={itemVariants}
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={isEditing ? editData.name : user?.name || ""}
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

                    <MotionTextField
                      variants={itemVariants}
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={isEditing ? editData.email : user?.email || ""}
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

                    <MotionTextField
                      variants={itemVariants}
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={isEditing ? editData.phone : user?.phone || ""}
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
                </Box>
              </Card>

              {/* Support Section */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: 'linear-gradient(120deg, #1976d2, #42a5f5)',
                    color: 'white'
                  }}
                >
                  <MotionTypography 
                    variant="h6" 
                    fontWeight="bold"
                    variants={itemVariants}
                  >
                    Support & Help
                  </MotionTypography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Need help with your account or have a question about our services?
                  </Typography>
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    sx={{ mt: 2 }}
                  >
                    <MotionButton
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      startIcon={<HelpIcon />}
                      variant="contained"
                      color="info"
                      onClick={handleTicketModalOpen}
                      sx={{ flex: 1 }}
                    >
                      Submit Ticket
                    </MotionButton>

                    <MotionButton
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      startIcon={<HelpIcon />}
                      variant="outlined"
                      color="info"
                      onClick={handleViewAllTickets}
                      sx={{ flex: 1 }}
                    >
                      View All Tickets
                    </MotionButton>
                  </Stack>
                </Box>
              </Card>
            </MotionBox>
          </MotionBox>
        </MotionBox>
      )}

      {/* Tickets Dialog */}
      <Dialog
        open={ticketsDialogOpen}
        onClose={handleCloseTicketsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(120deg, #1976d2, #42a5f5)',
            color: 'white',
            p: 3
          }}
        >
          <Typography variant="h6" fontWeight="bold">Your Support Tickets</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {isLoadingTickets ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : tickets.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                You haven't submitted any tickets yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                        }
                      }}
                    >
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {ticket.briefDescription}
                      </TableCell>
                      <TableCell>{ticket.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          color={
                            ticket.status === "Pending"
                              ? "warning"
                              : ticket.status === "InProgress"
                              ? "info"
                              : "success"
                          }
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          {ticketPage < totalTicketPages && (
            <Button
              onClick={handleLoadMoreTickets}
              disabled={isLoadingTickets}
              variant="outlined"
              color="primary"
              startIcon={isLoadingTickets ? <CircularProgress size={16} /> : null}
            >
              {isLoadingTickets ? "Loading..." : "Load More"}
            </Button>
          )}
          <Button 
            onClick={handleCloseTicketsDialog} 
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Modal */}
      <Modal
        open={passwordModalOpen}
        onClose={handlePasswordModalClose}
        aria-labelledby="change-password-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Typography
            id="change-password-modal"
            variant="h5"
            component="h2"
            color="primary.dark"
            fontWeight="bold"
            gutterBottom
          >
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
                type={showPasswords.oldPassword ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.oldPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("oldPassword")}
                      edge="end"
                    >
                      {showPasswords.oldPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                label="Current Password"
              />
              {passwordErrors.oldPassword && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {passwordErrors.oldPassword}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="new-password">New Password</InputLabel>
              <OutlinedInput
                id="new-password"
                name="newPassword"
                type={showPasswords.newPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("newPassword")}
                      edge="end"
                    >
                      {showPasswords.newPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                label="New Password"
              />
              {passwordErrors.newPassword && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {passwordErrors.newPassword}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="confirm-password">
                Confirm New Password
              </InputLabel>
              <OutlinedInput
                id="confirm-password"
                name="confirmPassword"
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirmPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                      edge="end"
                    >
                      {showPasswords.confirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                label="Confirm New Password"
              />
              {passwordErrors.confirmPassword && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {passwordErrors.confirmPassword}
                </Typography>
              )}
            </FormControl>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button variant="outlined" onClick={handlePasswordModalClose}>
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitPasswordChange}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Change Password"}
                </Button>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Ticket Modal */}
      <Modal
        open={ticketModalOpen}
        onClose={handleTicketModalClose}
        aria-labelledby="submit-ticket-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Typography
            id="submit-ticket-modal"
            variant="h5"
            component="h2"
            color="primary.dark"
            fontWeight="bold"
            gutterBottom
          >
            Submit Support Ticket
          </Typography>

          {ticketError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setTicketError(null)}
            >
              {ticketError}
            </Alert>
          )}

          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="ticket-type">Ticket Type</InputLabel>
              <Select
                id="ticket-type"
                value={ticketData.Type}
                onChange={handleTicketTypeChange}
                label="Ticket Type"
              >
                <MenuItem value="Shopping">Shopping</MenuItem>
                <MenuItem value="Technical">Technical</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Description"
              value={ticketData.Description}
              onChange={handleTicketDescriptionChange}
              error={!!ticketError}
              helperText={ticketError ? ticketError : "Please describe your issue in detail"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />

            {/* Ticket attachment display */}
            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="ticket-attachments"
                multiple
                type="file"
                onChange={handleTicketAttachmentsChange}
              />
              <label htmlFor="ticket-attachments">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddPhotoIcon />}
                  >
                    Add Attachments
                  </Button>
                </motion.div>
              </label>
              {ticketAttachments.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                  {ticketAttachments.length} file(s) selected
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button variant="outlined" onClick={handleTicketModalClose}>
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitTicket}
                  disabled={ticketLoading}
                >
                  {ticketLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default ProfilePage;
