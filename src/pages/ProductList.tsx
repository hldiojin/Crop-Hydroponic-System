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
  Pagination,
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
import productService, {
  SearchParams,
  SearchProductsResponse,
} from "../services/productService";
import { motion } from "framer-motion";
import { Zoom, Collapse } from "@mui/material";

interface Props {
  products?: Product[];
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
}

const ProductList: React.FC<Props> = ({
  products: initialProducts = [],
  onAddToCart,
  onEdit,
}) => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<{
    [key: string]: boolean;
  }>({
    category: false,
    search: false,
    price: false,
  });
  const [filterCount, setFilterCount] = useState<number>(0);

  // New pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortOrder, setSortOrder] = useState("nameAsc");
  const [searchResponse, setSearchResponse] =
    useState<SearchProductsResponse | null>(null);

  // Extract unique product categories from initialProducts for backward compatibility
  const productCategories = useMemo(() => {
    const uniqueCategories = new Map<string, { id: string; name: string }>();

    // Use filteredProducts from server search instead of initialProducts
    filteredProducts.forEach((product) => {
      if (product.categoryId && !uniqueCategories.has(product.categoryId)) {
        uniqueCategories.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName || "Unknown",
        });
      }
    });

    return Array.from(uniqueCategories.values());
  }, [filteredProducts]); // Changed dependency from initialProducts to filteredProducts

  // Update filter count when active filters change
  useEffect(() => {
    let count = 0;
    if (activeFilters.category) count++;
    if (activeFilters.search) count++;
    if (activeFilters.price) count++;
    setFilterCount(count);
  }, [activeFilters]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetchedCategories = await categoryService.getChildCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Server-side search function
  const performServerSearch = async (params: SearchParams = {}) => {
    setProductsLoading(true);
    try {
      const searchParams: SearchParams = {
        pageIndex: currentPage,
        pageSize,
        ...params,
      };

      // Add filters
      if (selectedCategory && selectedCategory !== "all") {
        searchParams.categoryId = selectedCategory;
      }
      if (searchText.trim()) {
        searchParams.keyword = searchText.trim();
      }
      if (minPrice !== undefined) {
        searchParams.minPrice = minPrice;
      }
      if (maxPrice !== undefined) {
        searchParams.maxPrice = maxPrice;
      }

      const response = await productService.searchProductsServer(searchParams);

      if (response.statusCodes === 200) {
        setSearchResponse(response);
        setFilteredProducts(
          response.response.data.map((product) => ({ ...product }))
        );
        setCurrentPage(response.response.currentPage);
        setTotalPages(response.response.totalPages);
        setTotalItems(response.response.totalItems);

        // Update active filters
        setActiveFilters({
          category: Boolean(selectedCategory && selectedCategory !== "all"),
          search: Boolean(searchText.trim()),
          price: Boolean(minPrice !== undefined || maxPrice !== undefined),
        });
      } else {
        setFilteredProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error performing server search:", error);
      setFilteredProducts([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setProductsLoading(false);
    }
  };

  // Initial load with server search
  useEffect(() => {
    performServerSearch();
  }, [currentPage, pageSize]);

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

  // Handle search text change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    performServerSearch();
  };

  // Handle enter key press in search field
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Handle category change
  const handleCategoryChange = async (event: SelectChangeEvent<string>) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page

    // Perform search with new category
    await performServerSearch({
      categoryId: categoryId !== "all" ? categoryId : undefined,
    });
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  // Handle price filter change
  const handlePriceFilterChange = () => {
    setCurrentPage(1); // Reset to first page
    performServerSearch();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchText("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCurrentPage(1);
    setActiveFilters({
      category: false,
      search: false,
      price: false,
    });

    // Perform search with cleared filters
    performServerSearch({});
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategory("all");
    setCurrentPage(1);
    performServerSearch({ categoryId: undefined });
  };

  // Clear search filter
  const clearSearchFilter = () => {
    setSearchText("");
    setCurrentPage(1);
    performServerSearch({ keyword: undefined });
  };

  // Clear price filter
  const clearPriceFilter = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCurrentPage(1);
    performServerSearch({ minPrice: undefined, maxPrice: undefined });
  };

  // Get the selected category name for display in the filter chip
  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return "All";

    // Find in categories from API
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (category) return category.name;

    // Fallback to product categories for backward compatibility
    const productCategory = productCategories.find(
      (cat) => cat.id === selectedCategory
    );
    return productCategory?.name || selectedCategory;
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
              label={`${totalItems} product(s) found`}
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
          <Grid item xs={12} sm={6} md={3} lg={3}>
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
                <MenuItem value="all">Tất cả danh mục</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Search Filter */}
          <Grid item xs={12} sm={6} md={3} lg={3}>
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

          {/* Price Filter */}
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Min Price"
                type="number"
                size="small"
                value={minPrice || ""}
                onChange={(e) =>
                  setMinPrice(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                InputProps={{
                  inputProps: { min: 0 },
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Max Price"
                type="number"
                size="small"
                value={maxPrice || ""}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                InputProps={{
                  inputProps: { min: 0 },
                }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>

          {/* Search Button - now stacks properly on smaller screens */}
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            lg={3}
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
              disabled={categoriesLoading}
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
        {(activeFilters.category ||
          activeFilters.search ||
          activeFilters.price) && (
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

              {activeFilters.price && (
                <Chip
                  label={`Price: ${minPrice || 0} - ${maxPrice || "∞"} VND`}
                  onDelete={clearPriceFilter}
                  color="info"
                  size="small"
                  sx={{
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": {
                      color: theme.palette.info.main,
                    },
                    "&:hover": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.info.main,
                        0.2
                      )}`,
                    },
                    transition: "all 0.2s",
                  }}
                />
              )}

              <Button
                variant="text"
                size="small"
                onClick={clearAllFilters}
                startIcon={<ClearIcon />}
                sx={{
                  ml: "auto",
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                  },
                }}
              >
                Clear All
              </Button>
            </Box>
          </Collapse>
        )}

        {/* Pagination and Page Size Controls */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Show:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                displayEmpty
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              products per page
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Showing{" "}
            {filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
            to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            products
          </Typography>
        </Box>
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
                  label={`${totalItems} product(s) found`}
                  color="default"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 500, ml: 2 }}
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
                      />
                    </Grid>
                  </Zoom>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                    pt: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
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
