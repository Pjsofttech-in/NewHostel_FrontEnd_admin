import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  MenuItem,
} from "@mui/material";
import { Popconfirm } from "antd";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  createFloor,
  getAllFloors,
  deleteFloor,
  updateFloor,
} from "../../../Services/SettingService/FloorService";
import AlertService from "../../../Components/Common/AlertService";
import LoadingOverlay from "../../../Components/Common/LoadingOverlay";
import { useSession } from "../../Common/useSession";
import HostelRooms from "./HostelRooms"; // 👈 room management component

export default function HostelFloor() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null); // 👈 for room management view
  const [formData, setFormData] = useState({
    id: null,
    floorName: "",
    totalRooms: 0,
    hostelBuildingName: "",
  });
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { role, email, branchCode } = useSession();

  const floorOptions = [
    { value: "Ground Floor", label: "Ground Floor" },
    { value: "1st Floor", label: "1st Floor" },
    { value: "2nd Floor", label: "2nd Floor" },
    { value: "3rd Floor", label: "3rd Floor" },
    { value: "4th Floor", label: "4th Floor" },
    { value: "5th Floor", label: "5th Floor" },
    { value: "6th Floor", label: "6th Floor" },
    { value: "7th Floor", label: "7th Floor" },
    { value: "8th Floor", label: "8th Floor" },
    { value: "9th Floor", label: "9th Floor" },
    { value: "10th Floor", label: "10th Floor" },
  ];

  // -------------------- Floor Card --------------------
  const FloorCard = ({ floor }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{floor.floorName}</Typography>
          <Box>
            <IconButton
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(floor);
              }}
              size="small"
            >
              <EditIcon />
            </IconButton>
            <Box component="span" onClick={(e) => e.stopPropagation()}>
              <Popconfirm
                title="Delete Floor"
                description={`Are you sure you want to delete ${floor.floorName}?`}
                onConfirm={() => handleDelete(floor)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
                disabled={deletingId === floor.id}
              >
                <IconButton color="error" size="small" disabled={deletingId === floor.id}>
                  <DeleteIcon />
                </IconButton>
              </Popconfirm>
            </Box>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Rooms
            </Typography>
            <Typography variant="h6">{floor.totalRooms}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              Allocated
            </Typography>
            <Typography
              variant="h6"
              color={floor.allocatedRooms > 0 ? "primary" : "text.primary"}
            >
              {floor.allocatedRooms || 0}
            </Typography>
          </Box>
        </Box>

        {floor.hostelBuildingName && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              Building Name: {floor.hostelBuildingName}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* 👇 Overlay for Manage Rooms */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          transition: "opacity 0.3s",
          background: "rgba(0,0,0,0.4)",
          borderRadius: 2,
          "&:hover": { opacity: 1 },
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setSelectedFloor(floor)}
        >
          Manage Rooms
        </Button>
      </Box>
    </Card>
  );

  // -------------------- Fetch Floors --------------------
  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const data = await getAllFloors(role, email, branchCode);
      setFloors(data);
    } catch (error) {
      AlertService.error(error.response?.data?.message || "Failed to fetch floors");
      console.error("Error fetching floors:", error);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Handlers --------------------
  const handleOpen = () => {
    setFormData({
      id: null,
      floorName: "",
      totalRooms: 0,
      hostelBuildingName: "",
      allocatedRooms: 0,
    });
    setIsEditMode(false);
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.floorName) newErrors.floorName = "Floor number is required";
    if (formData.totalRooms < 0) newErrors.totalRooms = "Total rooms cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const floorData = {
        hostelBuildingName: formData.hostelBuildingName,
        floorName: formData.floorName,
        totalRooms: Number(formData.totalRooms),
        allocatedRooms: formData.allocatedRooms || 0,
      };

      if (isEditMode) {
        await updateFloor(formData.id, floorData, role, email);
        AlertService.success("Floor updated successfully!");
      } else {
        await createFloor(floorData, role, email);
        AlertService.success("Floor created successfully!");
      }

      fetchFloors();
      handleClose();
    } catch (error) {
      const action = isEditMode ? "update" : "create";
      AlertService.error(error.response?.data?.message || `Failed to ${action} floor`);
      console.error(`Error ${action}ing floor:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (floor) => {
    setFormData({
      id: floor.id,
      floorName: floor.floorName,
      totalRooms: floor.totalRooms,
      hostelBuildingName: floor.hostelBuildingName || "",
      allocatedRooms: floor.allocatedRooms || 0,
    });
    setIsEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (floor) => {
    if (!floor) return;
    try {
      setDeletingId(floor.id);
      await deleteFloor(floor.id, role, email);
      AlertService.success("Floor deleted successfully!");
      fetchFloors();
    } catch (error) {
      AlertService.error(error.message || "Failed to delete floor");
      console.error("Error deleting floor:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // -------------------- Return --------------------
  return selectedFloor ? (
    <HostelRooms
      floor={selectedFloor}
      onBack={() => setSelectedFloor(null)}
    />
  ) : (
    <div elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Manage Floors
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add New Floor
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          mt: 3,
        }}
      >
        {floors.map((floor) => (
          <Box key={floor.id} sx={{ position: "relative" }}>
            <FloorCard floor={floor} />
          </Box>
        ))}
      </Box>

      {floors.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No floors found. Add a new floor to get started.
          </Typography>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{isEditMode ? "Edit Floor" : "Add New Floor"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Floor Number"
                  name="floorName"
                  value={formData.floorName}
                  onChange={handleChange}
                  error={!!errors.floorName}
                  helperText={errors.floorName}
                  margin="normal"
                  required
                >
                  {floorOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Rooms"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleChange}
                  error={!!errors.totalRooms}
                  helperText={errors.totalRooms}
                  margin="normal"
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Building Name"
                  name="hostelBuildingName"
                  value={formData.hostelBuildingName}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Floor
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <LoadingOverlay open={loading} />
    </div>
  );
}
