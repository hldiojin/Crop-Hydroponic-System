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
  Grid,
  List,
  ListItem,
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
  ShoppingBasket as OrdersIcon,
  RemoveRedEye as ViewIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import ticketService from "../services/ticketService";
import {
  getAllOrders,
  getOrderById,
  OrderDetail,
  OrderSummary,
  cancelOrder
} from "../services/orderSevice";
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
  buttonVariants,
} from "../utils/motion";
import { set } from "date-fns";

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

  // Add states for ticket detail view
  const [ticketDetailsDialogOpen, setTicketDetailsDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<any>(null);
  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false);
  const [ticketDetailsError, setTicketDetailsError] = useState<string | null>(
    null
  );

  // Order state
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const [totalOrderPages, setTotalOrderPages] = useState(1);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Order detail state
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [confirmCancelOrderDialogOpen, setConfirmCancelOrderDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] =
    useState<OrderDetail | null>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState<string | null>(
    null
  );

  const [loadingCancelOrder, setLoadingCancelOrder] = useState(false);

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
        message: "Làm mới thông tin cá nhân thành công",
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

  // Add handler for viewing ticket details
  const handleViewTicketDetails = async (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setLoadingTicketDetails(true);
    setTicketDetailsError(null);

    try {
      const response = await ticketService.getTicketById(ticketId);
      if (response && response.statusCodes === 200) {
        setSelectedTicketDetails(response.response.data);
      } else {
        setTicketDetailsError(
          "Failed to fetch ticket details. Please try again."
        );
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setTicketDetailsError("An error occurred while fetching ticket details");
    } finally {
      setLoadingTicketDetails(false);
      setTicketDetailsDialogOpen(true);
    }
  };

  const handleCloseTicketDetailsDialog = () => {
    setTicketDetailsDialogOpen(false);
    setSelectedTicketDetails(null);
    setSelectedTicketId(null);
  };

  // Format date string for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get status chip color
  const getStatusColor = (
    status: string
  ): "warning" | "info" | "success" | "error" => {
    switch (status) {
      case "Pending":
        return "warning";
      case "InProgress":
        return "info";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "info";
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  // Add handler functions for orders
  const handleViewAllOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await getAllOrders(orderPage);
      setOrders(response.response.data);
      setTotalOrderPages(response.response.totalPages);
      setOrdersDialogOpen(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setSnackbar({
        open: true,
        message: "Failed to load orders",
        severity: "error",
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleOpenConfirmCancelOrderDialog = () => {
    setConfirmCancelOrderDialogOpen(true);
  }

  const handleLoadMoreOrders = async () => {
    if (orderPage < totalOrderPages) {
      setIsLoadingOrders(true);
      try {
        const nextPage = orderPage + 1;
        const response = await getAllOrders(nextPage);
        setOrders((prev) => [...prev, ...response.response.data]);
        setOrderPage(nextPage);
        setTotalOrderPages(response.response.totalPages);
      } catch (error) {
        console.error("Error fetching more orders:", error);
        setSnackbar({
          open: true,
          message: "Failed to load more orders",
          severity: "error",
        });
      } finally {
        setIsLoadingOrders(false);
      }
    }
  };

  const handleCloseOrdersDialog = () => {
    setOrdersDialogOpen(false);
    setOrderPage(1);
  };

  const handleViewOrderDetails = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setLoadingOrderDetails(true);
    setOrderDetailsError(null);

    try {
      const response = await getOrderById(orderId);
      if (response && response.statusCodes === 200) {
        setSelectedOrderDetails(response.response.data);
      } else {
        setOrderDetailsError(
          "Failed to fetch order details. Please try again."
        );
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setOrderDetailsError("An error occurred while fetching order details");
    } finally {
      setLoadingOrderDetails(false);
      setOrderDetailsDialogOpen(true);
    }
  };

  const handleCloseOrderDetailsDialog = () => {
    setOrderDetailsDialogOpen(false);
    setSelectedOrderDetails(null);
    setSelectedOrderId(null);
  };

  const handleCloseConfirmCancelOrderDialog = () => {
    setConfirmCancelOrderDialogOpen(false);
  }

  const handleCancelOrder = async (orderId: string) => {
    setLoadingCancelOrder(true);
    try {
      // Call the cancel order API here
      await cancelOrder(orderId);
      setSnackbar({
        open: true,
        message: "Order cancelled successfully",
        severity: "success",
      });
      await handleViewAllOrders(); // Refresh the orders list
      await handleViewOrderDetails(orderId);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setSnackbar({
        open: true,
        message: "Failed to cancel order",
        severity: "error",
      });
    } finally {
      setConfirmCancelOrderDialogOpen(false);
      setLoadingCancelOrder(false);
    }
  }

  // Helper function to get status color for orders
  const getOrderStatusColor = (
    status: string
  ): "warning" | "info" | "success" | "error" => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
      case "delivering":
        return "info";
      case "delivered":
      case "done":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "info";
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
        .format(amount)
        .replace("₫", "") + " ₫"
    );
  };

  const handleUpdateProfile = async () => {
    var useUpdate = {
      name: editData.name,
      phone: editData.phone,
    };

    try {
      await updateProfile(useUpdate);
      setSnackbar({
        open: true,
        message: "Cập nhật thông tin thành công",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Cập nhật thông tin thất bại",
        severity: "error",
      });
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%)",
        backgroundAttachment: "fixed",
        overflow: "auto",
        paddingTop: "84px", // Increased padding to move content away from navbar
      }}
    >
      {loadingProfile ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="calc(100vh - 84px)"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: "primary.main" }}
          />
          <Typography variant="h6" color="text.secondary">
            Loading your profile...
          </Typography>
        </Box>
      ) : (
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            minHeight: "calc(100vh - 84px)",
            p: { xs: 2, sm: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: "5%",
              right: "5%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.03) 70%, rgba(76, 175, 80, 0) 100%)",
              zIndex: 0,
              display: { xs: "none", md: "block" },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "10%",
              left: "5%",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(33, 150, 243, 0.06) 0%, rgba(33, 150, 243, 0.02) 70%, rgba(33, 150, 243, 0) 100%)",
              zIndex: 0,
              display: { xs: "none", md: "block" },
            }}
          />

          {/* Header with back button and title */}
          <MotionBox
            variants={itemVariants}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 3, md: 5 },
              position: "relative",
              zIndex: 1,
            }}
          >
            <IconButton
              color="primary"
              onClick={() => navigate("/")}
              sx={{
                bgcolor: "rgba(46, 125, 50, 0.1)",
                "&:hover": { bgcolor: "rgba(46, 125, 50, 0.2)" },
                boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                width: 48,
                height: 48,
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
                textAlign: "center",
                flex: 1,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                textShadow: "0 2px 4px rgba(0,0,0,0.08)",
              }}
            >
              Thông tin của tôi
            </MotionTypography>

            {/* Just a dummy element to center the title */}
            <Box sx={{ width: 48 }} />
          </MotionBox>

          {/* Main content area */}
          <MotionBox
            variants={containerVariants}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 3, md: 5 },
              flex: 1,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Left sidebar with avatar and quick actions */}
            <MotionBox
              variants={itemVariants}
              sx={{
                width: { xs: "100%", md: "320px" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Card
                elevation={6}
                sx={{
                  borderRadius: 6,
                  p: { xs: 3, md: 4 },
                  width: "100%",
                  textAlign: "center",
                  background: "linear-gradient(to bottom, #ffffff, #f5f5f5)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <Box position="relative" display="inline-block" mb={3}>
                  <MotionAvatar
                    variants={logoVariants}
                    src={avatarPreview || user?.attachment || undefined}
                    alt={user?.name}
                    sx={{
                      width: 140,
                      height: 140,
                      border: "5px solid white",
                      boxShadow: "0 8px 20px rgba(46, 125, 50, 0.2)",
                      margin: "0 auto",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
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
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          width: 42,
                          height: 42,
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
                  sx={{ mb: 1 }}
                >
                  {user?.name}
                </MotionTypography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 3,
                  }}
                >
                  <Chip
                    icon={<BadgeIcon fontSize="small" />}
                    label={user?.role || "User"}
                    color="primary"
                    size="small"
                    sx={{
                      fontWeight: "medium",
                      px: 1,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                    }}
                  />

                  {user?.status && (
                    <Chip
                      label={user.status}
                      color={user.status === "Active" ? "success" : "warning"}
                      size="small"
                      sx={{
                        fontWeight: "medium",
                        px: 1,
                        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                      }}
                    />
                  )}
                </Box>
              </Card>

              {/* Quick actions card */}
              <Card
                elevation={4}
                sx={{
                  borderRadius: 6,
                  p: { xs: 3, md: 4 },
                  width: "100%",
                  background: "linear-gradient(to bottom, #ffffff, #f8f8f8)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <MotionTypography
                  variant="h6"
                  component="h3"
                  fontWeight="bold"
                  color="primary.dark"
                  gutterBottom
                  variants={itemVariants}
                  sx={{ mb: 2 }}
                >
                  Hành động nhanh
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
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      "&:hover": {
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    Đổi mật khẩu
                  </MotionButton>

                  <MotionButton
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    startIcon={<OrdersIcon />}
                    variant="outlined"
                    onClick={handleViewAllOrders}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      "&:hover": {
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    Xem đơn hàng
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
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      "&:hover": {
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    {loadingProfile ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Làm mới thông tin"
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
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {/* Personal Information Card */}
              <Card
                elevation={4}
                sx={{
                  borderRadius: 6,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    background: "linear-gradient(120deg, #2e7d32, #60ad5e)",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "150px",
                      height: "150px",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
                      borderRadius: "50%",
                    }}
                  />

                  <MotionTypography
                    variant="h6"
                    fontWeight="bold"
                    variants={itemVariants}
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      fontSize: { xs: "1.2rem", md: "1.4rem" },
                    }}
                  >
                    Thông tin cá nhân
                  </MotionTypography>
                </Box>

                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  {error && (
                    <Alert
                      severity="error"
                      onClose={clearError}
                      sx={{ mb: 3, borderRadius: 2 }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Stack spacing={3}>
                    <MotionTextField
                      variants={itemVariants}
                      fullWidth
                      label="Họ và tên"
                      name="name"
                      required
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
                        sx: {
                          borderRadius: 2,
                          "&:hover": {
                            boxShadow: isEditing
                              ? "0 2px 8px rgba(0,0,0,0.08)"
                              : "none",
                          },
                        },
                      }}
                    />

                    <MotionTextField
                      variants={itemVariants}
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      required
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
                        sx: {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <MotionTextField
                      variants={itemVariants}
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      required
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
                        sx: {
                          borderRadius: 2,
                          "&:hover": {
                            boxShadow: isEditing
                              ? "0 2px 8px rgba(0,0,0,0.08)"
                              : "none",
                          },
                        },
                      }}
                    />
                    <MotionButton
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      variant="outlined"
                      startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                      onClick={() => {
                        setIsEditing((prev) => !prev);
                        if (isEditing) {
                          handleUpdateProfile();
                        }
                      }}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        "&:hover": {
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      {isEditing ? "Lưu thay đổi" : "Chỉnh sửa thông tin"}
                    </MotionButton>
                  </Stack>
                </Box>
              </Card>

              {/* Support Section */}
              <Card
                elevation={4}
                sx={{
                  borderRadius: 6,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    background: "linear-gradient(120deg, #1976d2, #42a5f5)",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "150px",
                      height: "150px",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
                      borderRadius: "50%",
                    }}
                  />

                  <MotionTypography
                    variant="h6"
                    fontWeight="bold"
                    variants={itemVariants}
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      fontSize: { xs: "1.2rem", md: "1.4rem" },
                    }}
                  >
                    Hỗ trợ và trợ giúp
                  </MotionTypography>
                </Box>

                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{
                      fontSize: "1rem",
                      lineHeight: 1.6,
                    }}
                  >
                    Cần trợ giúp với tài khoản của bạn hoặc có câu hỏi về dịch
                    vụ của chúng tôi? Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp
                    đỡ bạn.
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ mt: 3 }}
                  >
                    <MotionButton
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      startIcon={<HelpIcon />}
                      variant="contained"
                      color="info"
                      onClick={handleTicketModalOpen}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                      }}
                    >
                      Gửi yêu cầu
                    </MotionButton>

                    <MotionButton
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      startIcon={<HelpIcon />}
                      variant="outlined"
                      color="info"
                      onClick={handleViewAllTickets}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 3,
                      }}
                    >
                      Xem tất cả yêu cầu
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
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(120deg, #1976d2, #42a5f5)",
            color: "white",
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Yêu cầu hỗ trợ của bạn
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {isLoadingTickets ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : tickets.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                Bạn chưa gửi bất kỳ yêu cầu hỗ trợ nào.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Loại</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          maxWidth: 300,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {ticket.briefDescription}
                      </TableCell>
                      <TableCell>{ticket.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status)}
                          size="small"
                          sx={{ fontWeight: "medium" }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleViewTicketDetails(ticket.id)}
                          sx={{
                            minWidth: "auto",
                            borderRadius: 2,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                            "&:hover": {
                              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                            },
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}
        >
          {ticketPage < totalTicketPages && (
            <Button
              onClick={handleLoadMoreTickets}
              disabled={isLoadingTickets}
              variant="outlined"
              color="primary"
              startIcon={
                isLoadingTickets ? <CircularProgress size={16} /> : null
              }
            >
              {isLoadingTickets ? "Đang tải..." : "Tải thêm"}
            </Button>
          )}
          <Button
            onClick={handleCloseTicketsDialog}
            variant="contained"
            color="primary"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add the new Ticket Details Dialog */}
      <Dialog
        open={ticketDetailsDialogOpen}
        onClose={handleCloseTicketDetailsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(120deg, #1976d2, #42a5f5)",
            color: "white",
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Chi tiết yêu cầu
          </Typography>
          <Chip
            label={selectedTicketDetails?.status || "Đang tải..."}
            color={getStatusColor(selectedTicketDetails?.status || "Pending")}
            size="small"
            sx={{ fontWeight: "bold", px: 1 }}
          />
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loadingTicketDetails ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
            >
              <CircularProgress />
            </Box>
          ) : ticketDetailsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {ticketDetailsError}
            </Alert>
          ) : selectedTicketDetails ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Mã yêu cầu
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" paragraph>
                      {selectedTicketDetails.id}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Loại
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" paragraph>
                      {selectedTicketDetails.type}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(selectedTicketDetails.createdAt)}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Trạng thái
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={selectedTicketDetails.status}
                        color={getStatusColor(selectedTicketDetails.status)}
                        sx={{ fontWeight: "medium" }}
                      />
                    </Box>

                    {selectedTicketDetails.statusUpdatedAt && (
                      <>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Trạng thái đã cập nhật
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          paragraph
                        >
                          {formatDate(selectedTicketDetails.statusUpdatedAt)}
                        </Typography>
                      </>
                    )}

                    {selectedTicketDetails.assignee && (
                      <>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Được giao cho
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedTicketDetails.assignee}
                        </Typography>
                      </>
                    )}
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Mô tả
                    </Typography>
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedTicketDetails.description}
                    </Typography>
                  </Card>
                </Grid>

                {selectedTicketDetails.attachments &&
                  selectedTicketDetails.attachments.length > 0 && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Tài liệu đính kèm
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {selectedTicketDetails.attachments.map(
                          (attachment: string, index: number) => {
                            // Extract file extension to determine type
                            const fileExt =
                              attachment.split(".").pop()?.toLowerCase() || "";
                            const isImage = [
                              "jpg",
                              "jpeg",
                              "png",
                              "gif",
                              "webp",
                              "bmp",
                            ].includes(fileExt);

                            return (
                              <Card
                                key={index}
                                variant="outlined"
                                sx={{
                                  width: 200,
                                  overflow: "hidden",
                                  transition: "transform 0.2s",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <a
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                  }}
                                >
                                  {isImage ? (
                                    <Box
                                      component="img"
                                      src={attachment}
                                      alt={`Attachment ${index + 1}`}
                                      sx={{
                                        width: "100%",
                                        height: 120,
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        height: 120,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "grey.100",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {fileExt.toUpperCase()} File
                                      </Typography>
                                    </Box>
                                  )}
                                  <Box sx={{ p: 1 }}>
                                    <Typography variant="caption" noWrap>
                                      {`Attachment ${index + 1}`}
                                    </Typography>
                                  </Box>
                                </a>
                              </Card>
                            );
                          }
                        )}
                      </Box>
                    </Grid>
                  )}

                {selectedTicketDetails.ticketResponses &&
                  selectedTicketDetails.ticketResponses.length > 0 && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Các phản hồi
                      </Typography>
                      <Stack spacing={2}>
                        {selectedTicketDetails.ticketResponses.map(
                          (response: any, index: number) => {
                            const isStaff =
                              response.userId !==
                              selectedTicketDetails.createdBy;

                            return (
                              <Card
                                key={index}
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  bgcolor: isStaff
                                    ? "primary.lightest"
                                    : "grey.50",
                                  borderLeft: isStaff
                                    ? "4px solid #1976d2"
                                    : "4px solid #4caf50",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 1,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                  >
                                    {isStaff
                                      ? response.userFullName || "Support Staff"
                                      : "You"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDate(response.createdAt)}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "pre-wrap" }}
                                >
                                  {response.message}
                                </Typography>

                                {/* Handle response attachments if they exist */}
                                {response.attachments &&
                                  response.attachments.length > 0 && (
                                    <Box
                                      sx={{
                                        mt: 2,
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 1,
                                      }}
                                    >
                                      {response.attachments.map(
                                        (
                                          attachment: string,
                                          attIndex: number
                                        ) => {
                                          const fileExt =
                                            attachment
                                              .split(".")
                                              .pop()
                                              ?.toLowerCase() || "";
                                          const isImage = [
                                            "jpg",
                                            "jpeg",
                                            "png",
                                            "gif",
                                            "webp",
                                            "bmp",
                                          ].includes(fileExt);

                                          return isImage ? (
                                            <Box
                                              key={attIndex}
                                              component="a"
                                              href={attachment}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              sx={{
                                                display: "block",
                                                width: 80,
                                                height: 80,
                                                borderRadius: 1,
                                                overflow: "hidden",
                                                border:
                                                  "1px solid rgba(0,0,0,0.1)",
                                              }}
                                            >
                                              <Box
                                                component="img"
                                                src={attachment}
                                                alt={`Response ${index + 1
                                                  } Attachment ${attIndex + 1}`}
                                                sx={{
                                                  width: "100%",
                                                  height: "100%",
                                                  objectFit: "cover",
                                                }}
                                              />
                                            </Box>
                                          ) : (
                                            <Box
                                              key={attIndex}
                                              component="a"
                                              href={attachment}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: 80,
                                                height: 80,
                                                borderRadius: 1,
                                                bgcolor: "grey.100",
                                                border:
                                                  "1px solid rgba(0,0,0,0.1)",
                                                textDecoration: "none",
                                              }}
                                            >
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                              >
                                                {fileExt.toUpperCase()}
                                              </Typography>
                                            </Box>
                                          );
                                        }
                                      )}
                                    </Box>
                                  )}
                              </Card>
                            );
                          }
                        )}
                      </Stack>
                    </Grid>
                  )}
              </Grid>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Không có chi tiết yêu cầu
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}
        >
          <Button
            onClick={handleCloseTicketDetailsDialog}
            variant="contained"
            color="primary"
          >
            Đóng
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
            Đổi mật khẩu
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="old-password">Mật khẩu hiện tại</InputLabel>
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
                label="Mật khẩu hiện tại"
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
              <InputLabel htmlFor="new-password">Mật khẩu mới</InputLabel>
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
                label="Mật khẩu mới"
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
                Xác nhận mật khẩu mới
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
                label="Xác nhận mật khẩu mới"
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
                Hủy bỏ
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
                  {loading ? <CircularProgress size={24} /> : "Đổi mật khẩu"}
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
            maxHeight: "90vh",
            overflowY: "auto",
            margin: "0 auto",
            "&:focus": {
              outline: "none",
            },
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
            Gửi yêu cầu hỗ trợ
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
              <InputLabel htmlFor="ticket-type">Loại yêu cầu</InputLabel>
              <Select
                id="ticket-type"
                value={ticketData.Type}
                onChange={handleTicketTypeChange}
                label="Loại yêu cầu"
              >
                <MenuItem value="Shopping">Mua hàng</MenuItem>
                <MenuItem value="Technical">Kỹ thuật</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Mô tả"
              value={ticketData.Description}
              onChange={handleTicketDescriptionChange}
              error={!!ticketError}
              helperText={
                ticketError
                  ? ticketError
                  : "Vui lòng mô tả vấn đề của bạn chi tiết"
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
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
                    Thêm tài liệu đính kèm
                  </Button>
                </motion.div>
              </label>
              {ticketAttachments.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "success.main" }}
                >
                  {ticketAttachments.length} tài liệu đã chọn
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
                Hủy bỏ
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
                    "Gửi yêu cầu"
                  )}
                </Button>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Orders Dialog */}
      <Dialog
        open={ordersDialogOpen}
        onClose={handleCloseOrdersDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(120deg, #2e7d32, #4caf50)",
            color: "white",
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Đơn hàng của bạn
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {isLoadingOrders ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                Bạn chưa đặt hàng nào.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Mã đơn hàng
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Ngày đặt hàng
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Tổng cộng</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {order.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(order.totalPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getOrderStatusColor(order.status)}
                          size="small"
                          sx={{ fontWeight: "medium" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="primary"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewOrderDetails(order.id)}
                          sx={{
                            minWidth: "auto",
                            borderRadius: 2,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                            "&:hover": {
                              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                            },
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}
        >
          {orderPage < totalOrderPages && (
            <Button
              onClick={handleLoadMoreOrders}
              disabled={isLoadingOrders}
              variant="outlined"
              color="primary"
              startIcon={
                isLoadingOrders ? <CircularProgress size={16} /> : null
              }
            >
              {isLoadingOrders ? "Đang tải..." : "Tải thêm"}
            </Button>
          )}
          <Button
            onClick={handleCloseOrdersDialog}
            variant="contained"
            color="primary"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsDialogOpen}
        onClose={handleCloseOrderDetailsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(120deg, #2e7d32, #4caf50)",
            color: "white",
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Chi tiết đơn hàng
          </Typography>
          {selectedOrderDetails && (
            <Chip
              label={selectedOrderDetails.status}
              color={getOrderStatusColor(selectedOrderDetails.status)}
              size="small"
              sx={{ fontWeight: "bold", px: 1 }}
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loadingOrderDetails ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
            >
              <CircularProgress />
            </Box>
          ) : orderDetailsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {orderDetailsError}
            </Alert>
          ) : selectedOrderDetails ? (
            <Box>
              <Grid container spacing={3}>
                {/* Order Summary */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Mã đơn hàng
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" paragraph>
                      {selectedOrderDetails.orderId}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Ngày đặt hàng
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" paragraph>
                      {selectedOrderDetails.transactions &&
                        selectedOrderDetails.transactions.length > 0
                        ? formatDate(
                          selectedOrderDetails.transactions[0].createdAt
                        )
                        : "N/A"}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Trạng thái
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={selectedOrderDetails.status}
                        color={getOrderStatusColor(selectedOrderDetails.status)}
                        sx={{ fontWeight: "medium" }}
                      />
                    </Box>
                  </Card>
                </Grid>

                {/* Payment Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Phương thức thanh toán
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" paragraph>
                      {selectedOrderDetails.transactions &&
                        selectedOrderDetails.transactions.length > 0
                        ? selectedOrderDetails.transactions[0].paymentMethod ===
                          "BANK"
                          ? "Online Payment (PayOS)"
                          : "Cash on Delivery"
                        : "N/A"}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Trạng thái thanh toán
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" paragraph>
                      {selectedOrderDetails.transactions &&
                        selectedOrderDetails.transactions.length > 0
                        ? selectedOrderDetails.transactions[0].paymentStatus ==
                          "PAID"
                          ? "Đã thanh toán"
                          : selectedOrderDetails.transactions[0]
                            .paymentStatus == "PENDING"
                            ? "Chờ thanh toán"
                            : selectedOrderDetails.transactions[0]
                              .paymentStatus == "FAILED"
                              ? "Thanh toán thất bại"
                              : selectedOrderDetails.transactions[0]
                                .paymentStatus == "REFUNDED"
                                ? "Đã hoàn tiền"
                                : selectedOrderDetails.transactions[0]
                                  .paymentStatus == "CANCELED"
                                  ? "Đã hủy"
                                  : selectedOrderDetails.transactions[0]
                                    .paymentStatus == "PROCESSING"
                                    ? "Đang xử lý"
                                    : selectedOrderDetails.transactions[0].paymentStatus
                        : "N/A"}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tổng số tiền
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {formatCurrency(selectedOrderDetails.price)}
                    </Typography>
                  </Card>
                </Grid>

                {/* Shipping Information */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Địa chỉ giao hàng
                    </Typography>

                    {selectedOrderDetails.userAddress ? (
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedOrderDetails.userAddress.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOrderDetails.userAddress.phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOrderDetails.userAddress.address}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có thông tin địa chỉ giao hàng.
                      </Typography>
                    )}
                  </Card>
                </Grid>

                {/* Order Items */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Sản phẩm đơn hàng
                  </Typography>

                  {selectedOrderDetails.orderDetailsItems &&
                    selectedOrderDetails.orderDetailsItems.length > 0 ? (
                    <Card
                      variant="outlined"
                      sx={{ borderRadius: 2, overflow: "hidden" }}
                    >
                      <List disablePadding>
                        {selectedOrderDetails.orderDetailsItems.map(
                          (item, index) => (
                            <React.Fragment key={item.orderDetailsId}>
                              <ListItem
                                sx={{
                                  py: 2,
                                  px: 3,
                                  bgcolor:
                                    index % 2 === 0
                                      ? "transparent"
                                      : "rgba(0, 0, 0, 0.02)",
                                }}
                              >
                                <Box
                                  component="img"
                                  src={item.productImage}
                                  alt={item.productName}
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    objectFit: "cover",
                                    borderRadius: 1,
                                    mr: 2,
                                    border: "1px solid rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                  >
                                    {item.productName}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {formatCurrency(item.price)} ×{" "}
                                    {item.quantity}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                >
                                  {formatCurrency(item.totalPrice)}
                                </Typography>
                              </ListItem>
                              {index <
                                selectedOrderDetails.orderDetailsItems.length -
                                1 && <Divider />}
                            </React.Fragment>
                          )
                        )}
                      </List>

                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "rgba(0, 0, 0, 0.02)",
                          borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Tổng cộng:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Phí giao hàng:
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(selectedOrderDetails.price)}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ mt: 1 }}
                          >
                            {formatCurrency(selectedOrderDetails.shippingFee)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "primary.lightest",
                          borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Tổng cộng:
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {formatCurrency(selectedOrderDetails.price)}
                        </Typography>
                      </Box>
                    </Card>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Không có sản phẩm trong đơn hàng này.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Không có chi tiết đơn hàng.
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}
        >
          {selectedOrderDetails && selectedOrderDetails.transactions && selectedOrderDetails.transactions.length > 0 ? selectedOrderDetails.transactions[0].paymentMethod ===
            "COD"
            ? <Button
              onClick={handleOpenConfirmCancelOrderDialog}
              variant="contained"
              color="error"
              disabled={selectedOrderDetails.transactions[0].paymentMethod !==
                "COD" || loadingCancelOrder || selectedOrderDetails.status === "Cancelled"}
            >
              Hủy đơn hàng
            </Button>
            : null : null}
          <Button
            onClick={handleCloseOrderDetailsDialog}
            variant="contained"
            color="primary"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmCancelOrderDialogOpen}
        onClose={handleCloseConfirmCancelOrderDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(120deg, #2e7d32, #4caf50)",
            color: "white",
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Xác nhận hủy đơn hàng
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmCancelOrderDialog}
            variant="outlined"
            color="primary"
          >
            Đóng
          </Button>
          <Button
            onClick={() => selectedOrderDetails && handleCancelOrder(selectedOrderDetails.orderId)}
            variant="contained"
            color="error"
            disabled={loadingCancelOrder}
          >
            {loadingCancelOrder ? (
              <CircularProgress size={24} />
            ) : (
              "Xác nhận"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }} // Give more space from the top
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default ProfilePage;
