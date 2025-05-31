import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  IconButton,
  Button,
  Box,
  Container,
  Paper,
  Chip,
  useTheme,
  alpha,
  TextField,
  Stack,
  Badge,
  Alert,
  useMediaQuery,
  FormControlLabel,
  Radio,
  Checkbox,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  Payment,
  CheckCircleOutline,
  CreditCard,
  Home,
  LocationOn,
  NavigateNext,
  Delete,
} from "@mui/icons-material";
import { CartDetailItem } from "../services/cartService";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MotionBox,
  MotionButton,
  itemVariants,
  containerVariants,
  buttonVariants,
} from "../utils/motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ghnService } from "../services/ghnService";
import { n } from "framer-motion/dist/types.d-B50aGbjN";
import { changeDefaultAddress, deleteAddress, editAddress, getOrderById, updateOrderAddress } from "../services/orderSevice";
import { set } from "date-fns";

// Create properly typed motion components
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  status: string;
}

export interface EditShippingFormData {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
}

interface ShippingFormData {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  orderId?: string | null;
}

interface UserAddressResponse {
  statusCodes: number;
  response: {
    data: UserAddress[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    lastPage: boolean;
  };
}

interface Province {
  provinceId: number;
  provinceName: string;
}

interface District {
  provinceId: number;
  districtId: number;
  districtName: string;
}

interface Ward {
  wardCode: string;
  wardName: string;
}

const ShippingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isAuthenticated } = useAuth();
  const { orderId } = useParams();

  const [cartDetails, setCartDetails] = useState<CartDetailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Partial<ShippingFormData>>({});
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    null
  );

  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [wardList, setWardList] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Number>(0);
  const [selectedDistrict, setSelectedDistrict] = useState<Number>(0);
  const [selectedWard, setSelectedWard] = useState<string>("0");
  const [addressLoading, setAddressLoading] = useState<boolean>(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [useExistingAddress, setUseExistingAddress] = useState<boolean>(true);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [isFillAddress, setIsFillAddress] = useState<boolean>(false);
  const [formData, setFormData] = useState<ShippingFormData>({
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: "",
    isDefault: false,
  });
  const [editFormData, setEditFormData] = useState<EditShippingFormData>({
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: "",
  })
  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout/shipping" } });
    }
  }, [isAuthenticated, navigate]);

  const fetchUserAddress = async () => {
    try {
      setAddressLoading(true);

      // Get auth token from localStorage or context
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get<UserAddressResponse>(
        "https://api.hmes.site/api/useraddress",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          withCredentials: true,
        }
      );

      var newauthToken = response.headers["new-access-token"];
      if (newauthToken != null) {
        localStorage.setItem("authToken", newauthToken);
      }

      // Check if the response has the correct structure with nested data
      if (
        response.data &&
        response.data.response &&
        response.data.response.data &&
        response.data.response.data.length > 0
      ) {
        setUserAddresses(response.data.response.data);

        fetchOrder();

        // Set default address if available
        const defaultAddress = response.data.response.data.find(
          (addr) => addr.isDefault
        );
        if (defaultAddress) {
          setFormData((prev) => ({
            ...prev,
            name: defaultAddress.name,
            phone: defaultAddress.phone,
            address: defaultAddress.address,
            ward: defaultAddress.ward || "",
            district: defaultAddress.district || "",
            province: defaultAddress.province || "",
          }));
        }
      } else {
        setAddressError("No addresses found. Please add a new address.");
      }
    } catch (err: any) {
      console.error("Failed to fetch user address:", err);

      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("RefreshToken")
      ) {
        // Auth issue - redirect to login
        navigate("/login", { state: { from: "/checkout/shipping" } });
      } else {
        // Other error - continue with form
        setAddressError(
          "Failed to load saved addresses. You can enter a new one."
        );
      }
      setUseExistingAddress(false);
      setSelectedAddress(null);
    } finally {
      setAddressLoading(false);
      setLoading(false);
    }
  };

  const notUseExistingAddress = () => {
    setUseExistingAddress(false);
    setSelectedAddress(null);
    setFormData((prev) => ({
      ...prev,
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      province: "",
    }));
    setEditFormData((prev) => ({
      ...prev,
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      province: "",
    }));
    setIsFillAddress(false);
    setSelectedProvince(0);
    setSelectedDistrict(0);
    setSelectedWard("0");
    setFormErrors({});
  }

  const fetchOrder = async () => {
    try {
      if (!orderId) {
        navigate("/*");
        return;
      }

      const response = await getOrderById(orderId);
      if (response.statusCodes !== 200) {
        throw new Error("Failed to fetch order");
      }

      const getAddress = response.response.data.userAddress;

      setSelectedAddress(getAddress.addressId);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    }
  }

  const handleCloseOpenEdit = () => {
    setOpenEditDialog(false)
  }

  // Fetch user address from API
  useEffect(() => {
    fetchUserAddress();
  }, [isAuthenticated, navigate, orderId]);

  useEffect(() => {
    const syncCartDetails = () => {
      const selectedCartData = localStorage.getItem("selectedCartDetails");
      if (selectedCartData) {
        setCartDetails(JSON.parse(selectedCartData));
      } else {
        // Fallback to regular cart if no selected items
        const cartData = localStorage.getItem("cartDetails");
        if (cartData) {
          setCartDetails(JSON.parse(cartData));
        }
      }
    };

    // Get cart data when the page loads
    syncCartDetails();

    // Listen for localStorage changes
    window.addEventListener("storage", syncCartDetails);

    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener("storage", syncCartDetails);
    };
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await ghnService.getProvinces();
        if (response.statusCodes !== 200) {
          throw new Error("Failed to fetch provinces");
        }
        var provinces: Province[] = response.response
          .filter(
            (x: Province) => !x.provinceName.toLowerCase().includes("test")
          )
          .map(
            (province: Province): Province => ({
              provinceId: province.provinceId,
              provinceName: province.provinceName,
            })
          );
        setProvinceList(provinces);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };

    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await ghnService.getDistricts(
            String(selectedProvince)
          );
          if (response.statusCodes !== 200) {
            throw new Error("Failed to fetch districts");
          }
          setDistrictList(response.response);
        } catch (error) {
          console.error("Failed to fetch districts:", error);
        }
      }
    };

    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await ghnService.getWards(String(selectedDistrict));
          if (response.statusCodes !== 200) {
            throw new Error("Failed to fetch wards");
          }
          setWardList(response.response);
        } catch (error) {
          console.error("Failed to fetch wards:", error);
        }
      }
    };

    fetchDistricts();
    fetchWards();
    fetchProvinces();
  }, [selectedProvince, selectedDistrict, selectedWard]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error when field is changed
    if (formErrors[name as keyof ShippingFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error when field is changed
    if (formErrors[name as keyof ShippingFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  useEffect(() => {
    if (formData.name && formData.phone && formData.address && formData.ward && formData.district && formData.province) {
      setIsFillAddress(true);
    }
  }, [formData]);

  const handleShippingChange = async (key: string, value: string | number) => {
    switch (key) {
      case "province":
        var province = provinceList.find((x) => x.provinceId == value);
        setSelectedProvince(Number(value));
        setFormData((prev) => ({
          ...prev,
          province: province?.provinceName || "",
        }));
        setEditFormData((prev) => ({
          ...prev,
          province: province?.provinceName || "",
        }));
        setSelectedDistrict(0); // Reset district and ward lists
        setSelectedWard("0");
        setDistrictList([]); // Reset district and ward lists
        setWardList([]);
        break;
      case "district":
        setSelectedDistrict(Number(value));
        var district = districtList.find((x) => x.districtId == value);
        setFormData((prev) => ({
          ...prev,
          district: district?.districtName || "",
        }));
        setEditFormData((prev) => ({
          ...prev,
          district: district?.districtName || "",
        }));
        setWardList([]); // Reset ward list
        setSelectedWard("0");
        break;
      case "ward":
        setSelectedWard(value.toString());
        var ward = wardList.find((x) => x.wardCode == value);
        setFormData((prev) => ({ ...prev, ward: ward?.wardName || "" }));
        setEditFormData((prev) => ({ ...prev, ward: ward?.wardName || "" }));
        break;
      default:
        break;
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ShippingFormData> = {};

    if (!formData.name?.trim()) {
      errors.name = "Cần nhập tên";
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Cần nhập số điện thoại";
    }

    if (!formData.address?.trim()) {
      errors.address = "Cần nhập địa chỉ";
    }

    if (!formData.ward?.trim()) {
      errors.ward = "Cần nhập phường/xã";
    }

    if (!formData.district?.trim()) {
      errors.district = "Cần nhập quận/huyện";
    }

    if (!formData.province?.trim()) {
      errors.province = "Cần nhập tỉnh/thành phố";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenEdit = async () => {
    const selected = userAddresses.find(x => x.id === selectedAddress);
    if (!selected) return;

    try {
      // 1. Tìm ProvinceId
      setEditFormData((prev) => ({
        ...prev,
        name: selected.name,
        phone: selected.phone,
        address: selected.address,
        ward: selected.ward,
        district: selected.district,
        province: selected.province,
      }));
      const province = provinceList.find(p => p.provinceName === selected.province);
      if (province) {
        await handleShippingChange("province", province.provinceId); // trigger load District

        // 2. Load districtList xong mới tìm DistrictId
        const districtRes = await ghnService.getDistricts(String(province.provinceId));
        if (districtRes.statusCodes === 200) {
          setDistrictList(districtRes.response);

          const district: District | undefined = districtRes.response.find((d: District) => d.districtName === selected.district);
          if (district) {
            await handleShippingChange("district", district.districtId); // trigger load Ward

            // 3. Load wardList xong mới tìm WardCode
            const wardRes = await ghnService.getWards(String(district.districtId));
            if (wardRes.statusCodes === 200) {
              setWardList(wardRes.response);

              const ward: Ward | undefined = wardRes.response.find((w: Ward) => w.wardName === selected.ward);
              if (ward) {
                handleShippingChange("ward", ward.wardCode);
              }
            }
          }
        }
      }

      setOpenEditDialog(true);
    } catch (error) {
      console.error("Failed to open edit dialog:", error);
    }
  };


  const handleSetDefault = async () => {
    if (selectedAddress) {
      try {
        const response = await changeDefaultAddress(selectedAddress);
        if (response.statusCodes === 200) {
          setLoading(true);
          fetchUserAddress();
        }
      } catch (e) {
        console.log("Không thể đặt địa chỉ mặc định!");
      }
    }
  }

  const handleDeleteAddress = async () => {
    if (selectedAddress) {
      try {
        const response = await deleteAddress(selectedAddress);
        if (response.statusCodes === 200) {
          setLoading(true);
          fetchUserAddress();
        }
      } catch (e) {
        console.log("Không thể đặt địa chỉ mặc định!");
      }
    }
  }

  const handleEditAddress = async () => {
    if (selectedAddress) {
      setLoadingEdit(true)
      try {
        const response = await editAddress(selectedAddress, editFormData)
        if (response.statusCodes === 200) {
          setLoading(true);
          fetchUserAddress();
        }
      } catch (e) {
        console.log("Không thể cập nhật địa chỉ")
      } finally {
        setLoadingEdit(false);
        setOpenEditDialog(false);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Make sure we have the current order ID (created in CartPage)
    if (!orderId) {
      navigate("/*");
      return;
    }

    // If user wants to save the address and it's different from existing one,
    // or if they're creating a new address
    if (!useExistingAddress) {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error("No authentication token found");
        }
        if (!useExistingAddress) {
          const response = await axios.post(
            "https://api.hmes.site/api/useraddress",
            {
              name: formData.name,
              phone: formData.phone,
              address: formData.address,
              ward: formData.ward,
              district: formData.district,
              province: formData.province,
              isDefault: formData.isDefault,
              orderId: orderId,
            },
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          var newToken = response.headers["new-access-token"];
          if (newToken != null) {
            localStorage.setItem("authToken", newToken);
          }

          if (response.status === 200) {
            // Navigate to payment page
            navigate(`/checkout/${orderId}/payment`);
          }
        }
      } catch (err: any) {
        console.error("Failed to save address:", err);
        if (
          err.response?.status === 401 ||
          err.response?.data?.message?.includes("RefreshToken")
        ) {
          navigate("/login", { state: { from: `/checkout/${orderId}/shipping` } });
          return;
        } else if (err.response?.status === 404 && err.response?.data?.message?.includes("Address not found or invalid coordinates.")) {
          setAddressError("Địa chỉ không hợp lệ. Vui lòng kiểm tra lại.");
        }
      }
    } else if (selectedAddress) {
      if (selectedAddress) {
        const response = await updateOrderAddress(orderId, selectedAddress);
        if (response.statusCodes === 200) {
          // Navigate to payment page
          navigate(`/checkout/${orderId}/payment`);
        } else {
          setAddressError("Đã xảy ra lỗi khi cập nhật địa chỉ. Vui lòng thử lại.");
        }
      }
    }

    // Save address to local storage for later use
    // localStorage.setItem(
    //   "shippingAddress",
    //   JSON.stringify({
    //     name: formData.name,
    //     phone: formData.phone,
    //     address: formData.address,
    //     ward: formData.ward,
    //     district: formData.district,
    //     province: formData.province,
    //   })
    // );

  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #f9f9f9, #e8f5e9)",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: [0, 0, 270, 270, 0],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <LocalShipping
            sx={{ fontSize: 80, color: theme.palette.primary.main }}
          />
        </motion.div>
        <Typography variant="h6" color="textSecondary" sx={{ mt: 3 }}>
          Loading shipping information...
        </Typography>
      </Box>
    );
  }

  // Main shipping view
  return (
    <MotionContainer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      maxWidth="lg"
      sx={{
        py: 6,
        minHeight: "100vh",
        background: `linear-gradient(to bottom, #f9f9f9, #e8f5e9)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative shapes */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: alpha(theme.palette.primary.light, 0.1),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: alpha(theme.palette.secondary.light, 0.08),
          zIndex: 0,
        }}
      />

      {/* Header section */}
      <MotionBox
        variants={itemVariants}
        sx={{
          mb: 5,
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <IconButton
          onClick={() => {
            var backLocation = localStorage.getItem("backLocation");
            if (backLocation) {
              navigate(backLocation);
            } else {
              navigate("/cart");
            }
          }}
          sx={{
            mr: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
        >
          <ArrowBack />
        </IconButton>

        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.5px",
          }}
        >
          Thông tin vận chuyển
        </Typography>

        <Badge
          badgeContent={cartDetails.length}
          color="secondary"
          sx={{ ml: "auto" }}
        >
          <ShoppingCart
            sx={{ fontSize: 28, color: theme.palette.primary.main }}
          />
        </Badge>
      </MotionBox>

      {/* Steps indicator for checkout process */}
      <MotionBox
        variants={itemVariants}
        sx={{
          mb: 5,
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "80%",
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          {[
            { label: "Giỏ hàng", icon: <ShoppingCart /> },
            { label: "Vận chuyển", icon: <LocalShipping /> },
            { label: "Thanh toán", icon: <CreditCard /> },
            { label: "Xác nhận", icon: <CheckCircleOutline /> },
          ].map((step, index) => (
            <Box
              key={step.label}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "25%",
                position: "relative",
                cursor: index < 1 ? "pointer" : "default",
              }}
              onClick={index < 1 ? () => navigate("/cart") : undefined}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  bgcolor:
                    index <= 1
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.1),
                  color: index <= 1 ? "white" : theme.palette.primary.main,
                  mb: 1,
                  transition: "all 0.3s ease",
                }}
              >
                {step.icon}
              </Box>
              <Typography
                variant="body2"
                fontWeight={index === 1 ? "bold" : "normal"}
                color={index <= 1 ? "primary" : "text.secondary"}
              >
                {step.label}
              </Typography>

              {/* Connector line */}
              {index < 3 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 25,
                    right: "-50%",
                    width: "100%",
                    height: 3,
                    bgcolor:
                      index < 1
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.1),
                    zIndex: -1,
                  }}
                />
              )}
            </Box>
          ))}
        </Paper>
      </MotionBox>

      {addressError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {addressError}
        </Alert>
      )}

      {/* Main content */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4} justifyContent="center">
          {/* Shipping form - now centered and wider */}
          <Grid item xs={12} md={10} lg={8}>
            {userAddresses.length > 0 && (
              <MotionPaper
                variants={itemVariants}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  mb: 3,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: alpha(theme.palette.primary.light, 0.1),
                    zIndex: 0,
                  }}
                />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <LocationOn fontSize="small" color="primary" /> Địa chỉ đã lưu
                </Typography>

                <Stack spacing={2}>
                  {userAddresses.map((address) => (
                    <Paper
                      key={address.id}
                      elevation={0}
                      onClick={() => {
                        setSelectedAddress(address.id);
                        setUseExistingAddress(true);
                        setFormData((prev) => ({
                          ...prev,
                          name: address.name,
                          phone: address.phone,
                          address: address.address,
                          ward: address.ward || "",
                          district: address.district || "",
                          province: address.province || "",
                        }));
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.7),
                        border:
                          selectedAddress === address.id
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.2
                            )}`,
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      {selectedAddress === address.id && (
                        <Chip
                          label="Đã chọn"
                          size="small"
                          color="primary"
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            fontWeight: "medium",
                          }}
                        />
                      )}
                      {address.isDefault && (
                        <Chip
                          label="Mặc định"
                          size="small"
                          color="success"
                          sx={{
                            position: "absolute",
                            top: 10,
                            right:
                              selectedAddress === address.id ? 100 : 10,
                            fontWeight: "medium",
                          }}
                        />
                      )}
                      <Typography
                        variant="body1"
                        gutterBottom
                        fontWeight="medium"
                      >
                        {address.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {address.phone}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {address.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.ward && `${address.ward}, `}
                        {address.district && `${address.district}, `}
                        {address.province}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>

                <Grid container spacing={2} alignItems="center">
                  {/* Bên trái */}
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Radio
                          checked={!useExistingAddress}
                          onChange={() => notUseExistingAddress()}
                          name="useNewAddress"
                          color="primary"
                          disabled={addressLoading || loading}
                        />
                      }
                      label={
                        <Typography variant="body1">
                          Sử dụng địa chỉ khác
                        </Typography>
                      }
                      sx={{ mt: 2 }}
                    />
                  </Grid>

                  {/* Bên phải: các nút */}
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={2} justifyContent="flex-end">
                      <Grid item>
                        <MotionButton
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          variant="outlined"
                          color="warning"
                          onClick={handleOpenEdit}
                          disabled={!selectedAddress}
                          sx={{ fontWeight: "medium", borderRadius: 2, px: 3 }}
                        >
                          Sửa
                        </MotionButton>
                      </Grid>
                      <Grid item>
                        <MotionButton
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          color="error"
                          variant="outlined"
                          onClick={handleDeleteAddress}
                          disabled={userAddresses.find(x => x.id === selectedAddress)?.isDefault || !selectedAddress}
                          sx={{ fontWeight: "medium", borderRadius: 2, px: 3 }}
                        >
                          Xóa
                        </MotionButton>
                      </Grid>
                      <Grid item>
                        <MotionButton
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          variant="outlined"
                          onClick={handleSetDefault}
                          disabled={userAddresses.find(x => x.id === selectedAddress)?.isDefault || !selectedAddress}
                          sx={{ fontWeight: "medium", borderRadius: 2, px: 3 }}
                        >
                          Đặt làm địa chỉ mặc định
                        </MotionButton>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>


              </MotionPaper>
            )}

            <Dialog
              open={openEditDialog}
              onClose={handleCloseOpenEdit}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  overflow: "hidden",
                  maxHeight: "110vh",
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
                  Chỉnh sửa địa chỉ
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ p: 3, mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Họ và tên"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      sx={{ mb: 2, mt: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Số điện thoại"
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      sx={{ mb: 2, mt: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="address"
                      name="address"
                      label="Địa chỉ"
                      value={editFormData.address}
                      onChange={handleEditFormChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      sx={{ mb: 2 }}
                      placeholder="Số nhà, tên đường"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="demo-simple-select-standard-label">
                        Tỉnh/thành phố
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedProvince}
                        label="Tỉnh/thành phố"
                        onChange={(e) => {
                          handleShippingChange(
                            "province",
                            Number(e.target.value)
                          );
                        }}
                      >
                        {provinceList.map((province) => (
                          <MenuItem
                            key={province.provinceId}
                            value={province.provinceId}
                          >
                            {province.provinceName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="demo-simple-select-standard-label">
                        Quận/huyện
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedDistrict}
                        label="Quận/huyện"
                        onChange={(e) => {
                          handleShippingChange(
                            "district",
                            Number(e.target.value)
                          );
                        }}
                        disabled={districtList.length === 0}
                      >
                        {districtList.map((district) => (
                          <MenuItem
                            key={district.districtId}
                            value={district.districtId}
                          >
                            {district.districtName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="demo-simple-select-standard-label">
                        Phường/xã
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedWard}
                        label="Phường/xã"
                        onChange={(e) => {
                          handleShippingChange("ward", e.target.value);
                        }}
                        disabled={wardList.length === 0}
                      >
                        {wardList.map((ward) => (
                          <MenuItem key={ward.wardCode} value={ward.wardCode}>
                            {ward.wardName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleCloseOpenEdit}
                  variant="outlined"
                  color="primary"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => editFormData && handleEditAddress()}
                  variant="contained"
                  color="warning"
                  disabled={loadingEdit}
                >
                  {loadingEdit ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Xác nhận"
                  )}
                </Button>
              </DialogActions>
            </Dialog>

            {(!userAddresses.length || !useExistingAddress) && (
              <MotionPaper
                variants={itemVariants}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  mb: 3,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: alpha(theme.palette.secondary.light, 0.1),
                    zIndex: 0,
                  }}
                />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Home fontSize="small" color="primary" /> Địa chỉ vận chuyển
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Họ và tên"
                      value={formData.name}
                      onChange={handleFormChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Số điện thoại"
                      value={formData.phone}
                      onChange={handleFormChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="address"
                      name="address"
                      label="Địa chỉ"
                      value={formData.address}
                      onChange={handleFormChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      sx={{ mb: 2 }}
                      placeholder="Số nhà, tên đường"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="demo-simple-select-standard-label">
                        Tỉnh/thành phố
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedProvince}
                        label="Tỉnh/thành phố"
                        onChange={(e) => {
                          handleShippingChange(
                            "province",
                            Number(e.target.value)
                          );
                        }}
                      >
                        {provinceList.map((province) => (
                          <MenuItem
                            key={province.provinceId}
                            value={province.provinceId}
                          >
                            {province.provinceName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="demo-simple-select-standard-label">
                        Quận/huyện
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedDistrict}
                        label="Quận/huyện"
                        onChange={(e) => {
                          handleShippingChange(
                            "district",
                            Number(e.target.value)
                          );
                        }}
                        disabled={districtList.length === 0}
                      >
                        {districtList.map((district) => (
                          <MenuItem
                            key={district.districtId}
                            value={district.districtId}
                          >
                            {district.districtName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="demo-simple-select-standard-label">
                        Phường/xã
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedWard}
                        label="Phường/xã"
                        onChange={(e) => {
                          handleShippingChange("ward", Number(e.target.value));
                        }}
                        disabled={wardList.length === 0}
                      >
                        {wardList.map((ward) => (
                          <MenuItem key={ward.wardCode} value={ward.wardCode}>
                            {ward.wardName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isDefault}
                          onChange={handleFormChange}
                          name="isDefault"
                          color="primary"
                        />
                      }
                      label="Lưu địa chỉ cho các đơn hàng tương lai"
                    />
                  </Grid>
                </Grid>
              </MotionPaper>
            )}

            <MotionBox
              variants={itemVariants}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
              }}
            >
              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                startIcon={<ArrowBack />}
                variant="outlined"
                onClick={() => navigate("/cart")}
                sx={{
                  fontWeight: "medium",
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Quay lại giỏ hàng
              </MotionButton>

              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<NavigateNext />}
                disabled={
                  selectedAddress
                    ? (addressLoading || loading)
                    : (!isFillAddress && !useExistingAddress)
                }
                sx={{
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {!selectedAddress && (addressLoading && loading) ? (
                  <CircularProgress size={24} />
                ) : (
                  "Tiếp tục thanh toán"
                )}
              </MotionButton>
            </MotionBox>
          </Grid>
        </Grid>
      </form>
    </MotionContainer>
  );
};

export default ShippingPage;
