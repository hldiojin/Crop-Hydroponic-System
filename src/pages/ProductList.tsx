// src/pages/ProductList.tsx
import React, { useState, useEffect } from 'react';
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
  Pagination,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/types';
import NoProductsFound from '../components/NoProductsFound';
import categoryService, { Category } from '../services/categoryService';
import productService from '../services/productService';

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
  favorites
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<{[key: string]: boolean}>({
    category: false,
    search: false
  });
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetchedCategories = await categoryService.getAllFlattened();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
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
      if (activeFilters.category && selectedCategory !== 'all') {
        // Filter locally first
        result = result.filter(product => product.categoryId === selectedCategory);
        
        // If no results, try API
        if (result.length === 0) {
          result = await productService.getByCategory(selectedCategory);
        }
      }
      
      // Bước 2: Áp dụng bộ lọc tìm kiếm nếu có
      if (activeFilters.search && searchText.trim() !== '') {
        // Luôn tìm kiếm local trước
        result = productService.searchProductsLocally(result, searchText);
        
        // Nếu không có kết quả và đang không lọc bằng danh mục, thử tìm kiếm từ API
        if (result.length === 0 && (!activeFilters.category || selectedCategory === 'all')) {
          result = await productService.searchProducts(searchText);
        }
      }
      
      setFilteredProducts(result);
    } catch (error) {
      console.error('Error applying filters:', error);
      // Reset về ban đầu nếu có lỗi
      setFilteredProducts(initialProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  // Xử lý thay đổi danh mục
  const handleCategoryChange = async (event: SelectChangeEvent<string>) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    setActiveFilters(prev => ({...prev, category: categoryId !== 'all'}));
    
    // Áp dụng tất cả bộ lọc
    setTimeout(() => applyAllFilters(), 0);
  };

  // Xử lý thay đổi thanh tìm kiếm
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };
  
  // Xử lý nút tìm kiếm
  const handleSearch = () => {
    setActiveFilters(prev => ({...prev, search: searchText.trim() !== ''}));
    applyAllFilters();
  };
  
  // Xử lý phím Enter trong ô tìm kiếm
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchText('');
    setActiveFilters({
      category: false,
      search: false
    });
    setFilteredProducts(initialProducts);
  };

  // Xóa bộ lọc danh mục
  const clearCategoryFilter = () => {
    setSelectedCategory('all');
    setActiveFilters(prev => ({...prev, category: false}));
    setTimeout(() => applyAllFilters(), 0);
  };

  // Xóa bộ lọc tìm kiếm
  const clearSearchFilter = () => {
    setSearchText('');
    setActiveFilters(prev => ({...prev, search: false}));
    setTimeout(() => applyAllFilters(), 0);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Smart Hydroponic Solutions
      </Typography>
      
      {/* Filter Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filter Products
        </Typography>
        
        <Grid container spacing={2}>
          {/* Category Filter */}
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="category-filter-label">Filter by Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Filter by Category"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
                disabled={categoriesLoading}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Search Filter */}
          <Grid item xs={12} md={5}>
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
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchText('');
                        clearSearchFilter();
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          {/* Search Button */}
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              fullWidth
              variant="contained" 
              onClick={handleSearch}
              disabled={categoriesLoading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
        
        {/* Active Filters Display */}
        {(activeFilters.category || activeFilters.search) && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, my: 0.5 }}>
              Active Filters:
            </Typography>
            
            {activeFilters.category && (
              <Chip
                label={`Category: ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}`}
                onDelete={clearCategoryFilter}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            
            {activeFilters.search && (
              <Chip
                label={`Search: ${searchText}`}
                onDelete={clearSearchFilter}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            
            <Button
              size="small"
              variant="text"
              onClick={clearAllFilters}
              sx={{ ml: 'auto' }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Display filter results or loading state */}
      {productsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProducts.length > 0 ? (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Showing {filteredProducts.length} product(s)
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {filteredProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <ProductCard
                  product={product} 
                  onAddToCart={onAddToCart} 
                  onEdit={onEdit} 
                  onFavorite={onFavorite} 
                  favorites={favorites}
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No products found with the selected filters
          </Typography>
          <Button 
            variant="contained" 
            onClick={clearAllFilters}
            sx={{ mt: 2 }}
          >
            View All Products
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ProductList;