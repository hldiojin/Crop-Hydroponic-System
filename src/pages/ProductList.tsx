// src/pages/ProductList.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  IconButton,
  Fade,
  Divider,
  useTheme,
  alpha,
  Badge,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CategoryOutlined as CategoryIcon,
} from "@mui/icons-material";
import ProductCard from "../components/ProductCard";
import { Product } from "../types/types";
import NoProductsFound from "../components/NoProductsFound";
import categoryService, { Category } from "../services/categoryService";
import productService from "../services/productService";
import { motion } from "framer-motion";
import { Zoom, Collapse } from "@mui/material";

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: string[];
}

const ProductList: React.FC<Props> = ({
  products: initialProducts,
  onAddToCart,
  onEdit,
  onFavorite,
  favorites,
}) => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(initialProducts);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<{
    [key: string]: boolean;
  }>({
    category: false,
    search: false,
  });
  const [filterCount, setFilterCount] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState("nameAsc");

  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSortOrder(value);

    const sorted = [...filteredProducts].sort((a, b) => {
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

    setFilteredProducts(sorted);
  };

  // Extract unique product categories from initialProducts
  const productCategories = useMemo(() => {
    const uniqueCategories = new Map<string, { id: string; name: string }>();

    initialProducts.forEach((product) => {
      if (product.categoryId && !uniqueCategories.has(product.categoryId)) {
        uniqueCategories.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName || "Unknown",
        });
      }
    });

    return Array.from(uniqueCategories.values());
  }, [initialProducts]);

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

  // Set initial products
  useEffect(() => {
    setFilteredProducts(initialProducts);
  }, [initialProducts]);

  // Hàm áp dụng tất cả bộ lọc
  const applyAllFilters = async () => {
    setProductsLoading(true);

    try {
      let result = initialProducts;

      // Bước 1: Áp dụng bộ lọc danh mục nếu có
      if (activeFilters.category && selectedCategory !== "all") {
        // Filter locally first by categoryId
        result = result.filter(
          (product) => product.categoryId === selectedCategory
        );

        // If no results, try API
        if (result.length === 0) {
          result = await productService.getByCategory(selectedCategory);
        }
      }

      // Bước 2: Áp dụng bộ lọc tìm kiếm nếu có
      if (activeFilters.search && searchText.trim() !== "") {
        // Luôn tìm kiếm local trước
        result = productService.searchProductsLocally(result, searchText);

        // Nếu không có kết quả và đang không lọc bằng danh mục, thử tìm kiếm từ API
        if (
          result.length === 0 &&
          (!activeFilters.category || selectedCategory === "all")
        ) {
          result = await productService.searchProducts(searchText);
        }
      }

      setFilteredProducts(result);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Reset về ban đầu nếu có lỗi
      setFilteredProducts(initialProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  // Xử lý thay đổi danh mục - cập nhật và áp dụng ngay lập tức
  const handleCategoryChange = async (event: SelectChangeEvent<string>) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    setActiveFilters((prev) => ({ ...prev, category: categoryId !== "all" }));

    // Áp dụng filter ngay lập tức
    setProductsLoading(true);
    try {
      if (categoryId === "all") {
        // Nếu chọn "All", chỉ áp dụng filter search nếu có
        if (activeFilters.search && searchText.trim() !== "") {
          let result = productService.searchProductsLocally(
            initialProducts,
            searchText
          );
          if (result.length === 0) {
            result = await productService.searchProducts(searchText);
          }
          setFilteredProducts(result);
        } else {
          setFilteredProducts(initialProducts);
        }
      } else {
        // Filter bằng categoryId
        let result = initialProducts.filter(
          (product) => product.categoryId === categoryId
        );

        // Nếu không có kết quả, thử API
        if (result.length === 0) {
          result = await productService.getByCategory(categoryId);
        }

        // Áp dụng thêm filter search nếu có
        if (activeFilters.search && searchText.trim() !== "") {
          result = productService.searchProductsLocally(result, searchText);
        }

        setFilteredProducts(result);
      }
    } catch (error) {
      console.error("Error filtering by category:", error);
      setFilteredProducts(initialProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  // Xử lý thay đổi thanh tìm kiếm
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Xử lý nút tìm kiếm
  const handleSearch = () => {
    const hasSearchText = searchText.trim() !== "";
    setActiveFilters((prev) => ({ ...prev, search: hasSearchText }));

    // Áp dụng tất cả bộ lọc
    if (hasSearchText || activeFilters.category) {
      applyAllFilters();
    } else {
      setFilteredProducts(initialProducts);
    }
  };

  // Xử lý phím Enter trong ô tìm kiếm
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchText("");
    setActiveFilters({
      category: false,
      search: false,
    });
    setFilteredProducts(initialProducts);
  };

  // Xóa bộ lọc danh mục
  const clearCategoryFilter = () => {
    setSelectedCategory("all");
    setActiveFilters((prev) => ({ ...prev, category: false }));

    // Áp dụng lại chỉ filter search nếu có
    if (activeFilters.search && searchText.trim() !== "") {
      setTimeout(() => applyAllFilters(), 0);
    } else {
      setFilteredProducts(initialProducts);
    }
  };

  // Xóa bộ lọc tìm kiếm
  const clearSearchFilter = () => {
    setSearchText("");
    setActiveFilters((prev) => ({ ...prev, search: false }));

    // Áp dụng lại chỉ filter category nếu có
    if (activeFilters.category && selectedCategory !== "all") {
      setTimeout(() => {
        setProductsLoading(true);
        const result = initialProducts.filter(
          (product) => product.categoryId === selectedCategory
        );
        setFilteredProducts(result);
        setProductsLoading(false);
      }, 0);
    } else {
      setFilteredProducts(initialProducts);
    }
  };

  // Get the selected category name for display in the filter chip
  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return "All";

    // First check in product categories
    const productCategory = productCategories.find(
      (cat) => cat.id === selectedCategory
    );
    if (productCategory) return productCategory.name;

    // Fallback to categories from API
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.name || selectedCategory;
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 600,
          mb: 3,
          color: theme.palette.primary.main,
        }}
      >
        Smart Hydroponic Solutions
      </Typography>

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
              Filter Products
            </Typography>
          </Box>

          {filterCount > 0 && (
            <Badge
              badgeContent={filterCount}
              color="primary"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.8rem" } }}
            >
              <Typography variant="body2" color="text.secondary">
                Active Filters
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
              Products
            </Typography>
            <Chip
              label={`${filteredProducts.length} product(s) found`}
              color="default"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 500, ml: 2 }}
            />
          </Box>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-by-label">Sort by</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortOrder}
              onChange={handleSortChange}
              label="Sort by"
              size="small"
            >
              <MenuItem value="nameAsc">Name (A-Z)</MenuItem>
              <MenuItem value="nameDesc">Name (Z-A)</MenuItem>
              <MenuItem value="priceAsc">Price (Low-High)</MenuItem>
              <MenuItem value="priceDesc">Price (High-Low)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} alignItems="flex-start">
          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={5} lg={5}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">
                Filter by Category
              </InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Filter by Category"
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
                <MenuItem value="all">All Categories</MenuItem>
                {productCategories.map((category) => (
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
              label="Search by ID or Name"
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

          {/* Search Button - now stacks properly on smaller screens */}
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
              Search
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
                Active Filters:
              </Typography>

              {activeFilters.category && (
                <Chip
                  label={`Category: ${getSelectedCategoryName()}`}
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
                  label={`Search: ${searchText}`}
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
                Clear All
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
                <Grid item key={item} xs={12} sm={6} md={4} lg={3}>
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
        ) : filteredProducts.length > 0 ? (
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
                  Products
                </Typography>
                <Chip
                  label={`${filteredProducts.length} product(s) found`}
                  color="default"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              <Grid container spacing={3}>
                {filteredProducts.map((product, index) => (
                  <Zoom
                    in={true}
                    style={{
                      transitionDelay: `${index * 50}ms`,
                    }}
                    key={product.id}
                  >
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <ProductCard
                        product={product}
                        onAddToCart={(p) => {
                          // Show visual feedback
                          setSnackbarMessage(`${p.name} added to cart!`);
                          setSnackbarOpen(true);
                          onAddToCart(p);
                        }}
                        onEdit={onEdit}
                        onFavorite={(p) => {
                          const isFav = favorites.includes(p.id);
                          setSnackbarMessage(
                            isFav
                              ? `${p.name} removed from favorites`
                              : `${p.name} added to favorites!`
                          );
                          setSnackbarOpen(true);
                          onFavorite(p);
                        }}
                        favorites={favorites}
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
                No products found with the selected filters
              </Typography>
              <Button
                variant="contained"
                onClick={clearAllFilters}
                sx={{ mt: 2 }}
                startIcon={<FilterListIcon />}
              >
                View All Products
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

export default ProductList;
