// src/pages/AdminDashboard.tsx
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Inventory,
  AttachMoney,
  LocalFlorist,
  Settings,
  Science,
  Edit,
  Delete,
} from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', pt: 8, pb: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Sales</Typography>
                    <Typography variant="h4">$23,678</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <AttachMoney />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+15% from last month</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#2196f3', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Users</Typography>
                    <Typography variant="h4">1,254</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <People />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+7% new users</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Products</Typography>
                    <Typography variant="h4">345</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Inventory />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+12 this week</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#f44336', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Orders</Typography>
                    <Typography variant="h4">789</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <LocalFlorist />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">+23 today</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <List>
                {[1, 2, 3, 4, 5].map((item) => (
                  <React.Fragment key={item}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <Science />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Order #${1000 + item}`}
                        secondary={`$${Math.floor(Math.random() * 1000)}.00 - Status: Processing`}
                      />
                    </ListItem>
                    {item < 5 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Product Categories */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Product Categories
              </Typography>
              <Box sx={{ mt: 3 }}>
                {[
                  { name: 'Plants', value: 35, color: '#4caf50' },
                  { name: 'Systems', value: 25, color: '#2196f3' },
                  { name: 'Nutrients', value: 40, color: '#ff9800' },
                ].map((category) => (
                  <Box key={category.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{category.name}</Typography>
                      <Typography variant="body2">{category.value}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={category.value}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: category.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;