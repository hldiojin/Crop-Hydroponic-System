// src/pages/ProfilePage.tsx
import React, { useState, useRef } from "react";
import {
  Container,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Message as MessageIcon,
  AddAPhoto as AddPhotoIcon,
  Support as SupportIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import Chat from "../components/Chat";
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: Date;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [ticketFormOpen, setTicketFormOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [showChat, setShowChat] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setSnackbar({
          open: true,
          message: "Please select an image file",
          severity: "error",
        });
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "Image size should be less than 5MB",
          severity: "error",
        });
        return;
      }

      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      try {
        // Convert file to base64 string for storage
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;

          try {
            await updateProfile({ photoURL: base64String });
            setSnackbar({
              open: true,
              message: "Avatar updated successfully",
              severity: "success",
            });
          } catch (error) {
            console.error("Upload error:", error);
            setSnackbar({
              open: true,
              message: "Failed to update avatar",
              severity: "error",
            });
          }
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("File reading error:", error);
        setSnackbar({
          open: true,
          message: "Error processing image",
          severity: "error",
        });
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const handleCreateTicket = async (subject: string, description: string) => {
    try {
      const newTicket: Ticket = {
        id: Date.now().toString(),
        subject,
        description,
        status: 'open',
        createdAt: new Date(),
      };
      
      socket.emit('createTicket', newTicket);

      setSnackbar({
        open: true,
        message: "Support ticket created successfully",
        severity: "success",
      });
      setTicketFormOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to create support ticket",
        severity: "error",
      });
    }
  };

  const renderActionButtons = () => (
    <Box>
      <IconButton
        onClick={() => setIsEditing(true)}
        sx={{
          bgcolor: "background.paper",
          boxShadow: 2,
          "&:hover": {
            bgcolor: "background.paper",
            transform: "scale(1.1)",
          },
          transition: "transform 0.2s",
        }}
      >
        <EditIcon color="primary" />
      </IconButton>
      
      {!isAdmin && (
        <>
          <IconButton
            onClick={() => setTicketFormOpen(true)}
            sx={{
              ml: 1,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": {
                bgcolor: "background.paper",
                transform: "scale(1.1)",
              },
              transition: "transform 0.2s",
            }}
          >
            <SupportIcon color="primary" />
          </IconButton>
          
          <IconButton
            onClick={() => setShowChat(!showChat)}
            sx={{
              ml: 1,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": {
                bgcolor: "background.paper",
                transform: "scale(1.1)",
              },
              transition: "transform 0.2s",
            }}
          >
            <MessageIcon color="primary" />
          </IconButton>
        </>
      )}
    </Box>
  );

  const handleSaveClick = async () => {
    try {
      await updateProfile(editData);
      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card
            elevation={0}
            sx={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 150,
                bgcolor: "primary.main",
                background: "linear-gradient(120deg, #2e7d32 0%, #60ad5e 100%)",
              }}
            />
            <CardContent sx={{ position: "relative", pt: 12 }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", mb: 4 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={avatarPreview || user?.photoURL}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid white",
                      bgcolor: "primary.main",
                      fontSize: "3rem",
                      boxShadow: 3,
                    }}
                  >
                    {!avatarPreview &&
                      !user?.photoURL &&
                      user?.name?.charAt(0).toUpperCase()}
                  </Avatar>

                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "background.paper",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "background.paper" },
                    }}
                  >
                    <AddPhotoIcon color="primary" />
                  </IconButton>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                </Box>
                <Box sx={{ ml: 3, flex: 1 }}>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                      mb: -0.5,
                    }}
                  >
                    {user?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                {renderActionButtons()}
              </Box>

              <Divider sx={{ my: 3 }} />

              {isEditing ? (
                <Fade in={isEditing}>
                  <Box
                    component="form"
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <TextField
                      label="Name"
                      name="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Email"
                      name="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Phone"
                      name="phone"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Address"
                      name="address"
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        mt: 2,
                      }}
                    >
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
                        <Card
                          sx={{ bgcolor: "grey.50", p: 3, borderRadius: 3 }}
                        >
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
                              <Typography variant="h6">
                                {user?.email}
                              </Typography>
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
                              <Typography variant="h6">{user?.address || 'Not provided'}</Typography>
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

        {!isAdmin && (
          <Grid item xs={12} md={4}>
            <Fade in={showChat}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                }}
              >
                <CardContent>
                  <Chat />
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        )}
      </Grid>

      {/* Ticket Form Dialog */}
      <Dialog
        open={ticketFormOpen}
        onClose={() => setTicketFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject"
            fullWidth
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={ticketDescription}
            onChange={(e) => setTicketDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketFormOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleCreateTicket(ticketSubject, ticketDescription)}
            variant="contained"
            disabled={!ticketSubject.trim() || !ticketDescription.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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