import React from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Box,
  Divider,
} from "@mui/material";
import { Upload as AntUpload, Button } from "antd";
import { UploadOutlined, FileImageOutlined } from "@ant-design/icons";

const HostelInfoSection = ({
  formData,
  handleChange,
  applicantSignature,
  setApplicantSignature,
  parentSignature,
  setParentSignature,
}) => {
  const handleApplicantSignatureChange = (info) => {
    if (info.file) {
      setApplicantSignature(info.file.originFileObj || info.file);
    }
  };

  const handleParentSignatureChange = (info) => {
    if (info.file) {
      setParentSignature(info.file.originFileObj || info.file);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      alert("You can only upload image files!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      alert("Image must be smaller than 2MB!");
      return false;
    }
    return false;
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3, fontWeight: 600 }}>
          Hostel & Payment Information
        </Typography>

        {/* Stay Duration */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#555", mb: 2 }}>
            Stay Duration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stay From"
                name="stayFrom"
                type="date"
                value={formData.stayFrom}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stay To"
                name="stayTo"
                type="date"
                value={formData.stayTo}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Room Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#555", mb: 2 }}>
            Room Allocation
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Building Name"
                name="buildingName"
                value={formData.buildingName}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Room Number"
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Bed Type"
                name="bedType"
                value={formData.bedType}
                onChange={handleChange}
                required
                variant="outlined"
              >
                <MenuItem value="AC">AC</MenuItem>
                <MenuItem value="Non-AC">Non-AC</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bed Number"
                name="bedNo"
                value={formData.bedNo}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Payment Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#555", mb: 2 }}>
            Payment Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Deposited Status"
                name="depositedStatus"
                value={formData.depositedStatus}
                onChange={handleChange}
                required
                variant="outlined"
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Payment Mode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                required
                variant="outlined"
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
                <MenuItem value="Net Banking">Net Banking</MenuItem>
              </TextField>
            </Grid>

            {formData.paymentMode === "Cheque" && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cheque Number"
                  name="chequeNo"
                  value={formData.chequeNo}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GST Number"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g., Online, Walk-in"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Signatures */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#555", mb: 2 }}>
            Signatures
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Applicant Signature
                </Typography>
                <AntUpload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleApplicantSignatureChange}
                >
                  <Button icon={<UploadOutlined />} type="dashed" block>
                    Upload Applicant Signature
                  </Button>
                </AntUpload>
                {applicantSignature && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FileImageOutlined style={{ color: "#52c41a" }} />
                    <Typography variant="body2" color="success.main">
                      {applicantSignature.name}
                    </Typography>
                  </Box>
                )}
                {applicantSignature && (
                  <Box
                    component="img"
                    src={URL.createObjectURL(applicantSignature)}
                    alt="Applicant Signature"
                    sx={{
                      width: "100%",
                      maxWidth: 200,
                      height: 80,
                      objectFit: "contain",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      p: 1,
                      bgcolor: "#f9f9f9",
                    }}
                  />
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Parent/Guardian Signature
                </Typography>
                <AntUpload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleParentSignatureChange}
                >
                  <Button icon={<UploadOutlined />} type="dashed" block>
                    Upload Parent Signature
                  </Button>
                </AntUpload>
                {parentSignature && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FileImageOutlined style={{ color: "#52c41a" }} />
                    <Typography variant="body2" color="success.main">
                      {parentSignature.name}
                    </Typography>
                  </Box>
                )}
                {parentSignature && (
                  <Box
                    component="img"
                    src={URL.createObjectURL(parentSignature)}
                    alt="Parent Signature"
                    sx={{
                      width: "100%",
                      maxWidth: 200,
                      height: 80,
                      objectFit: "contain",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      p: 1,
                      bgcolor: "#f9f9f9",
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HostelInfoSection;
