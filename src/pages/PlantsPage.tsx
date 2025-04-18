// src/pages/PlantsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import ProductCard from "../components/ProductCard";
import { Product } from "../types/types";
import { LocalFlorist } from "@mui/icons-material";
import productService from "../services/productService";
import NoProductsFound from "../components/NoProductsFound";

interface Props {
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onFavorite: (product: Product) => void;
  favorites: string[]; // Thay đổi từ number[] sang string[]
}

const PlantsPage: React.FC<Props> = ({
  onAddToCart,
  onEdit,
  onFavorite,
  favorites,
}) => {
  const [plants, setPlants] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const plantProducts = await productService.getPlants();
        setPlants(plantProducts);
      } catch (err) {
        console.error("Error fetching plants:", err);
        setError("Failed to load plant products.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

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
        <LocalFlorist sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Cây thủy canh thông minh
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Khám phá sự lựa chọn của chúng tôi về cây thủy canh IoT
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Chip label="Dễ trồng" color="success" />
          <Chip label="Ứng dụng kết nối" color="primary" />
          <Chip label="Chăm sóc tự động" color="secondary" />
        </Box>
      </Box>

      {plants.length > 0 ? (
        <Grid container spacing={4}>
          {plants.map((product) => (
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
      ) : (
        <NoProductsFound />
      )}
    </Container>
  );
};

export default PlantsPage;
