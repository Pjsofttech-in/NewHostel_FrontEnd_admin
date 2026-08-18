import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Box,
  Divider,
} from "@mui/material";
import { Upload as AntUpload, Button } from "antd";
import { UploadOutlined, FileImageOutlined } from "@ant-design/icons";

const AddressSection = ({
  formData,
  handleChange,
  sameAsCurrent,
  setSameAsCurrent,
  applicantAddressProof,
  setApplicantAddressProof,
  parentAddressProof,
  setParentAddressProof,
}) => {
  const handleApplicantProofChange = (info) => {
    if (info.file) {
      setApplicantAddressProof(info.file.originFileObj || info.file);
    }
  };

  const handleParentProofChange = (info) => {
    if (info.file) {
      setParentAddressProof(info.file.originFileObj || info.file);
    }
  };

  const beforeUpload = (file) => {
    const isValid = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isValid) {
      alert("You can only upload image or PDF files!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      alert("File must be smaller than 5MB!");
      return false;
    }
    return false;
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>

        {/* Current Address */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#555", mb: 2 }}>
            Current Address
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Address"
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleChange}
                required
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pin Code"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ maxLength: 6 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AntUpload
                  accept="image/*,.pdf"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleApplicantProofChange}
                >
                  <Button icon={<UploadOutlined />} type="primary">
                    Upload Address Proof
                  </Button>
                </AntUpload>
                {applicantAddressProof && (
                  <Typography variant="body2" color="success.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FileImageOutlined /> {applicantAddressProof.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Permanent Address */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#555" }}>
              Permanent Address
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAsCurrent}
                  onChange={(e) => setSameAsCurrent(e.target.checked)}
                  color="primary"
                />
              }
              label="Same as Current Address"
            />
          </Box>

          {!sameAsCurrent && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Address"
                  name="pfullAddress"
                  value={formData.pfullAddress}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="pstate"
                  value={formData.pstate}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="pcity"
                  value={formData.pcity}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pin Code"
                  name="ppinCode"
                  value={formData.ppinCode}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
            </Grid>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Guardian Address */}
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "#555", mb: 2 }}>
            Guardian Address
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Address"
                name="gfullAddress"
                value={formData.gfullAddress}
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
                name="gstate"
                value={formData.gstate}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="gcity"
                value={formData.gcity}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pin Code"
                name="gpinCode"
                value={formData.gpinCode}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ maxLength: 6 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AntUpload
                  accept="image/*,.pdf"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleParentProofChange}
                >
                  <Button icon={<UploadOutlined />} type="primary">
                    Upload Parent Address Proof
                  </Button>
                </AntUpload>
                {parentAddressProof && (
                  <Typography variant="body2" color="success.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FileImageOutlined /> {parentAddressProof.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddressSection;
