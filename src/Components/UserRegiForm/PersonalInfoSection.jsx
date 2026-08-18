import React, { useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Upload, Image, Modal } from "antd";

const PersonalInfoSection = ({ formData, handleChange, studentPhoto, setStudentPhoto }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleUploadChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      setStudentPhoto(file);
    } else {
      setStudentPhoto(null);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Card elevation={3} >
      <CardContent>

        <Grid container spacing={2} >
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Contact Number"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              required
              variant="outlined"
              inputProps={{ maxLength: 10 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              variant="outlined"
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Birth Date"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>





          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Marital Status"
              name="martialStatus"
              value={formData.martialStatus}
              onChange={handleChange}
              required
              variant="outlined"
            >
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Divorced">Divorced</MenuItem>
              <MenuItem value="Widowed">Widowed</MenuItem>
            </TextField>
          </Grid>



          <Grid item xs={12} md={2.2}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
              variant="outlined"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Religion"
              name="religon"
              value={formData.religon}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Upload

              listType="picture-card"
              fileList={studentPhoto ? [{
                uid: '-1',
                name: 'student-photo.png',
                status: 'done',
                url: studentPhoto.preview || URL.createObjectURL(studentPhoto)
              }] : []}

              onPreview={handlePreview}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              onRemove={() => setStudentPhoto(null)}
              maxCount={1}
            >
              {!studentPhoto && uploadButton}
            </Upload>

          </Grid>



        </Grid>

        <Modal open={previewOpen} title="Preview" footer={null} onCancel={handleCancel}>
          <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;