import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

const AcademicInfoSection = ({ formData, handleChange }) => {
  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3, fontWeight: 600 }}>
          Academic Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Student ID Number"
              name="studentIdNo"
              value={formData.studentIdNo}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Institute Name"
              name="instituteName"
              value={formData.instituteName}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vehicle Number (Optional)"
              name="vehicleNo"
              value={formData.vehicleNo}
              onChange={handleChange}
              variant="outlined"
              placeholder="e.g., MH12AB1234"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AcademicInfoSection;
