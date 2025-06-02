// src/pages/NutrientsPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Divider,
  Collapse,
  Fade,
  Zoom,
  alpha,
  useTheme,
  Badge,
  Skeleton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Science,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CategoryOutlined as CategoryIcon,
} from "@mui/icons-material";
import ProductCard from "../components/ProductCard";
import { Product } from "../types/types";
import productService from "../services/productService";
import NoProductsFound from "../components/NoProductsFound";
import categoryService, { Category } from "../services/categoryService";

interface Props {
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
}

const NutrientsPage: React.FC<Props> = ({
  onAddToCart,
  onEdit,
}) => {
  const theme = useTheme();
  const [nutrients, setNutrients] = useState<Product[]>([]);
  const [filteredNutrients, setFilteredNutrients] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [sortOrder, setSortOrder] = useState("nameAsc");
  const [activeFilters, setActiveFilters] = useState<{
    [key: string]: boolean;
  }>({
    category: false,
    search: false,
  });
  const [filterCount, setFilterCount] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Extract unique product categories
  const nutrientCategories = useMemo(() => {
    const uniqueCategories = new Map<string, { id: string; name: string }>();

    nutrients.forEach((product) => {
      if (product.categoryId && !uniqueCategories.has(product.categoryId)) {
        uniqueCategories.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName || "Unknown",
        });
      }
    });

    return Array.from(uniqueCategories.values());
  }, [nutrients]);

  // Update filter count when active filters change
  useEffect(() => {
    let count = 0;
    if (activeFilters.category) count++;
    if (activeFilters.search) count++;
    setFilterCount(count);
  }, [activeFilters]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetchedCategories = await categoryService.getAllFlattened();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch nutrients data
  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        setLoading(true);
        const nutrientProducts = await productService.getNutrients();
        setNutrients(nutrientProducts);
        setFilteredNutrients(nutrientProducts);
      } catch (err) {
        console.error("Error fetching nutrients:", err);
        setError("Failed to load nutrient products.");
      } finally {
        setLoading(false);
      }
    };

    fetchNutrients();
  }, []);

  // Sorting function
  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSortOrder(value);

    const sorted = [...filteredNutrients].sort((a, b) => {
      switch (value) {
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setFilteredNutrients(sorted);
  };

  // Apply all filters
  const applyAllFilters = async () => {
    setProductsLoading(true);

    try {
      let result = nutrients;

      // Apply category filter if active
      if (activeFilters.category && selectedCategory !== "all") {
        // Filter locally by categoryId
        result = result.filter(
          (product) => product.categoryId === selectedCategory
        );

        // If no results, try API
        if (result.length === 0) {
          const categoryProducts = await productService.getByCategory(
            selectedCategory
          );
          // Only take nutrient products
          result = categoryProducts.filter((p) => p.type === "nutrient");
        }
      }

      // Apply search filter if active
      if (activeFilters.search && searchText.trim() !== "") {
        // Search locally first
        result = productService.searchProductsLocally(result, searchText);

        // If no results and not filtering by category, try API
        if (
          result.length === 0 &&
          (!activeFilters.category || selectedCategory === "all")
        ) {
          const searchResults = await productService.searchProducts(searchText);
          // Only take nutrient products
          result = searchResults.filter((p) => p.type === "nutrient");
        }
      }

      setFilteredNutrients(result);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Reset to initial nutrients if error
      setFilteredNutrients(nutrients);
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = async (event: SelectChangeEvent<string>) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    setActiveFilters((prev) => ({ ...prev, category: categoryId !== "all" }));

    // Apply filter immediately
    setProductsLoading(true);
    try {
      if (categoryId === "all") {
        // If "All" selected, only apply search filter if active
        if (activeFilters.search && searchText.trim() !== "") {
          let result = productService.searchProductsLocally(
            nutrients,
            searchText
          );
          if (result.length === 0) {
            const searchResults = await productService.searchProducts(
              searchText
            );
            result = searchResults.filter((p) => p.type === "nutrient");
          }
          setFilteredNutrients(result);
        } else {
          setFilteredNutrients(nutrients);
        }
      } else {
        // Filter by categoryId
        let result = nutrients.filter(
          (product) => product.categoryId === categoryId
        );

        // If no results, try API
        if (result.length === 0) {
          const categoryProducts = await productService.getByCategory(
            categoryId
          );
          result = categoryProducts.filter((p) => p.type === "nutrient");
        }

        // Apply search filter if active
        if (activeFilters.search && searchText.trim() !== "") {
          result = productService.searchProductsLocally(result, searchText);
        }

        setFilteredNutrients(result);
      }
    } catch (error) {
      console.error("Error filtering by category:", error);
      setFilteredNutrients(nutrients);
    } finally {
      setProductsLoading(false);
    }
  };

  // Handle search text change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    const hasSearchText = searchText.trim() !== "";
    setActiveFilters((prev) => ({ ...prev, search: hasSearchText }));

    // Apply all filters
    if (hasSearchText || activeFilters.category) {
      applyAllFilters();
    } else {
      setFilteredNutrients(nutrients);
    }
  };

  // Handle Enter key in search field
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchText("");
    setActiveFilters({
      category: false,
      search: false,
    });
    setFilteredNutrients(nutrients);
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategory("all");
    setActiveFilters((prev) => ({ ...prev, category: false }));

    // Apply only search filter if active
    if (activeFilters.search && searchText.trim() !== "") {
      setTimeout(() => applyAllFilters(), 0);
    } else {
      setFilteredNutrients(nutrients);
    }
  };

  // Clear search filter
  const clearSearchFilter = () => {
    setSearchText("");
    setActiveFilters((prev) => ({ ...prev, search: false }));

    // Apply only category filter if active
    if (activeFilters.category && selectedCategory !== "all") {
      setTimeout(() => {
        setProductsLoading(true);
        const result = nutrients.filter(
          (product) => product.categoryId === selectedCategory
        );
        setFilteredNutrients(result);
        setProductsLoading(false);
      }, 0);
    } else {
      setFilteredNutrients(nutrients);
    }
  };

  // Get selected category name for display
  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return "All";

    // Check in nutrient categories
    const nutrientCategory = nutrientCategories.find(
      (cat) => cat.id === selectedCategory
    );
    if (nutrientCategory) return nutrientCategory.name;

    // Fallback to categories from API
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.name || selectedCategory;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Science sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Dinh dưỡng thủy canh
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Dinh dưỡng tối ưu cho sự phát triển của cây trồng
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Chip label="Hữu cơ" color="success" />
          <Chip label="Hiệu suất cao" color="primary" />
          <Chip label="Cân bằng pH" color="secondary" />
        </Box>
      </Box>

      {/* Filter Section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
          position: "relative",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FilterListIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={500}>
              Lọc dinh dưỡng
            </Typography>
          </Box>

          {filterCount > 0 && (
            <Badge
              badgeContent={filterCount}
              color="primary"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.8rem" } }}
            >
              <Typography variant="body2" color="text.secondary">
                Bộ lọc đang hoạt động
              </Typography>
            </Badge>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              Dinh dưỡng
            </Typography>
            <Chip
              label={`${filteredNutrients.length} vật phẩm được tìm thấy`}
              color="default"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 500, ml: 2 }}
            />
          </Box>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-by-label">Sắp xếp theo</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortOrder}
              onChange={handleSortChange}
              label="Sắp xếp theo"
              size="small"
            >
              <MenuItem value="nameAsc">Tên (A-Z)</MenuItem>
              <MenuItem value="nameDesc">Tên (Z-A)</MenuItem>
              <MenuItem value="priceAsc">Giá (Thấp-Cao)</MenuItem>
              <MenuItem value="priceDesc">Giá (Cao-Thấp)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} alignItems="flex-start">
          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={5} lg={5}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">
                Lọc theo danh mục
              </InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Lọc theo danh mục"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon
                      color={activeFilters.category ? "primary" : "action"}
                    />
                  </InputAdornment>
                }
                disabled={categoriesLoading}
                sx={{
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 2px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                  ...(activeFilters.category && {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }),
                }}
              >
                <MenuItem value="all">Tất cả danh mục</MenuItem>
                {nutrientCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Search Filter */}
          <Grid item xs={12} sm={6} md={5} lg={5}>
            <TextField
              fullWidth
              label="Tìm kiếm theo tên"
              variant="outlined"
              value={searchText}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      color={activeFilters.search ? "primary" : "action"}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchText("");
                        clearSearchFilter();
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.secondary.main,
                    0.2
                  )}`,
                },
                ...(activeFilters.search && {
                  "& .MuiOutlinedInput-root": {
                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  },
                }),
              }}
            />
          </Grid>

          {/* Search Button */}
          <Grid
            item
            xs={12}
            sm={12}
            md={2}
            lg={2}
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", md: "center" },
              mt: { xs: 1, md: 0 },
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={categoriesLoading || searchText.trim() === ""}
              startIcon={<SearchIcon />}
              sx={{
                height: { xs: "48px", md: "56px" },
                boxShadow: theme.shadows[2],
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {(activeFilters.category || activeFilters.search) && (
          <Collapse in={true} timeout={300}>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                p: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  mr: 1,
                  my: 0.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
                Bộ lọc đang hoạt động:
              </Typography>

              {activeFilters.category && (
                <Chip
                  label={`Danh mục: ${getSelectedCategoryName()}`}
                  onDelete={clearCategoryFilter}
                  color="primary"
                  size="small"
                  sx={{
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": {
                      color: theme.palette.primary.main,
                    },
                    "&:hover": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    },
                    transition: "all 0.2s",
                  }}
                />
              )}

              {activeFilters.search && (
                <Chip
                  label={`Tìm kiếm: ${searchText}`}
                  onDelete={clearSearchFilter}
                  color="secondary"
                  size="small"
                  sx={{
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": {
                      color: theme.palette.secondary.main,
                    },
                    "&:hover": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.secondary.main,
                        0.2
                      )}`,
                    },
                    transition: "all 0.2s",
                  }}
                />
              )}

              <Button
                size="small"
                variant="text"
                onClick={clearAllFilters}
                sx={{
                  ml: "auto",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                  },
                }}
                startIcon={<ClearIcon fontSize="small" />}
              >
                Xóa tất cả
              </Button>
            </Box>
          </Collapse>
        )}
      </Paper>

      {/* Results Section */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 3,
          bgcolor: theme.palette.background.default,
          transition: "all 0.3s ease",
        }}
      >
        {/* Display filter results or loading state */}
        {productsLoading ? (
          <Box sx={{ width: "100%" }}>
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item key={item} xs={12} sm={6} md={4}>
                  <Paper
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      animation="wave"
                      sx={{ borderRadius: 1, mb: 2 }}
                    />
                    <Skeleton width="70%" height={30} animation="wave" />
                    <Skeleton
                      width="40%"
                      height={30}
                      animation="wave"
                      sx={{ mb: 1 }}
                    />
                    <Skeleton variant="text" animation="wave" />
                    <Skeleton variant="text" animation="wave" />
                    <Skeleton variant="text" animation="wave" />
                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Skeleton height={40} animation="wave" sx={{ mb: 1 }} />
                      <Skeleton height={40} animation="wave" />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : filteredNutrients.length > 0 ? (
          <Fade in={true}>
            <div>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" color="text.primary">
                  Sản phẩm dinh dưỡng
                </Typography>
                <Chip
                  label={`${filteredNutrients.length} vật phẩm được tìm thấy`}
                  color="default"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              <Grid container spacing={4}>
                {filteredNutrients.map((product, index) => (
                  <Zoom
                    in={true}
                    style={{
                      transitionDelay: `${index * 50}ms`,
                    }}
                    key={product.id}
                  >
                    <Grid item xs={12} sm={6} md={4}>
                      <ProductCard
                        product={product}
                        onAddToCart={(p) => {
                          // Show visual feedback
                          setSnackbarMessage(
                            `${p.name} đã được thêm vào giỏ hàng!`
                          );
                          setSnackbarOpen(true);
                          onAddToCart(p);
                        }}
                        onEdit={onEdit}
                      />
                    </Grid>
                  </Zoom>
                ))}
              </Grid>
            </div>
          </Fade>
        ) : (
          <Fade in={true}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <NoProductsFound />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Không tìm thấy sản phẩm dinh dưỡng với các bộ lọc đã chọn
              </Typography>
              <Button
                variant="contained"
                onClick={clearAllFilters}
                sx={{ mt: 2 }}
                startIcon={<FilterListIcon />}
              >
                Xem tất cả sản phẩm dinh dưỡng
              </Button>
            </Box>
          </Fade>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NutrientsPage;
