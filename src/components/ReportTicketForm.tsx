// src/components/ReportTicketForm.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { useAuth } from '../context/AuthContext';

interface FormData {
  issueType: string;
  description: string;
}

const ReportTicketForm: React.FC = () => {
  const { submitTicket, user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    issueType: "",
    description: "",
  });
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitTicket({
        userId: user?.id ?? 0,
        userName: user?.name ?? "",
        email: user?.email ?? "",
        issueType: formData.issueType,
        description: formData.description,
      });
      setSnackbarMessage('Ticket submitted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setFormData({
        issueType: "",
        description: "",
      });
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      setSnackbarMessage('Failed to submit ticket.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box
      sx={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
        backgroundColor: "white",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: "20px", textAlign: "center" }}>
        Report an Issue
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={user?.name ?? ""}
          margin="normal"
          disabled
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={user?.email ?? ""}
          margin="normal"
          disabled
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="issue-type-label">Issue Type</InputLabel>
          <Select
            labelId="issue-type-label"
            name="issueType"
            value={formData.issueType}
            onChange={handleSelectChange}
          >
            <MenuItem value="bug">Bug</MenuItem>
            <MenuItem value="feature">Feature Request</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          margin="normal"
          multiline
          rows={5}
          placeholder="Provide a detailed description of the issue..."
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ marginTop: "20px" }}
        >
          Submit Ticket
        </Button>
      </form>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportTicketForm;