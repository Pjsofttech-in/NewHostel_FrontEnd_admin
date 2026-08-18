import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
  Divider,
} from "@mui/material";

const FamilyInfoSection = ({ formData, handleChange }) => {
  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>


        {/* Father Details */}
    
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#555", mb: 2 }}>
            Guardian Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Father's Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Father's Mobile Number"
                name="mobNo"
                value={formData.mobNo}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
 
 


            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mother's Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mother's Mobile Number"
                name="motherMobNo"
                value={formData.motherMobNo}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

   


 
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Guardian's Name"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Guardian's Mobile Number"
                name="gmobNo"
                value={formData.gmobNo}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>



            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Doctor's Name"
                name="familyDoctorName"
                value={formData.familyDoctorName}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Doctor's Mobile Number"
                name="doctorMobileNo"
                value={formData.doctorMobileNo}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
        
 

      
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Address"
                name="parentFullAddress"
                value={formData.parentFullAddress}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="parentState"
                value={formData.parentState}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="parentCity"
                value={formData.parentCity}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pin Code"
                name="parentPinCode"
                value={formData.parentPinCode}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
          </Grid>
       
      </CardContent>
    </Card>
  );
};

export default FamilyInfoSection;
