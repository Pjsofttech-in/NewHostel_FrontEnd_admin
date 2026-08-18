// src/pages/Settings/HostelRoom.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from "@mui/material";
import { ArrowBack, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Popconfirm } from "antd";
import HostelBeds from "./HostelBeds"; // adjust import path
import {
  getRoomsByFloor,
  createRoom,
  updateRoom,
  deleteRoom
} from "../../../Services/SettingService/RoomService"; // adjust path
import AlertService from "../../../Components/Common/AlertService";
import LoadingOverlay from "../../../Components/Common/LoadingOverlay";
import { useSession } from "../../Common/useSession";

export default function HostelRoom({ floor, onBack }) {
  const { role, email, branchCode } = useSession();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    roomNumber: "",
    roomType: "",
    totalBeds: 1
  });
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomTypeOptions = [
    { value: "Single", label: "Single" },
    { value: "Double", label: "Double" },
    { value: "Triple", label: "Triple" },
    { value: "Dormitory", label: "Dormitory" },
  ];

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line
  }, [floor.id]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRoomsByFloor(floor.id, role, email);
      setRooms(data);
    } catch (error) {
      AlertService.error(error.response?.data?.message || "Failed to fetch rooms");
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (room = null) => {
    if (room) {
      setFormData({
        id: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        totalBeds: room.totalBeds
      });
      setIsEditMode(true);
    } else {
      setFormData({ id: null, roomNumber: "", roomType: "", totalBeds: 1 });
      setIsEditMode(false);
      setErrors({});
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomNumber) newErrors.roomNumber = "Room number is required";
    if (!formData.roomType) newErrors.roomType = "Room type is required";
    if (formData.totalBeds < 1) newErrors.totalBeds = "Total beds must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        totalBeds: Number(formData.totalBeds)
      };

      if (isEditMode) {
        await updateRoom(formData.id, payload, role, email);
        AlertService.success("Room updated successfully!");
      } else {
        await createRoom(payload, role, email, floor.id);
        AlertService.success("Room created successfully!");
      }

      fetchRooms();
      handleCloseDialog();
    } catch (error) {
      AlertService.error(error.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} room`);
      console.error(`Error ${isEditMode ? "updating" : "creating"} room:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    handleOpenDialog(room);
  };

  const handleDelete = async (room) => {
    if (!room) return;
    try {
      setDeletingId(room.id);
      await deleteRoom(room.id, role, email);
      AlertService.success("Room deleted successfully!");
      fetchRooms();
    } catch (error) {
      AlertService.error(error.response?.data?.message || "Failed to delete room");
      console.error("Error deleting room:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Render beds view if a room is selected
  if (selectedRoom) {
    return (
      <HostelBeds
        room={selectedRoom}
        onBack={() => setSelectedRoom(null)}
      />
    );
  }

  // Otherwise render rooms list view
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5">
            Rooms of {floor.floorName}
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog(null)}>
          Add Room
        </Button>
      </Box>

      <Grid container spacing={2}>
        {rooms.map(room => (
          <Grid key={room.id} item xs={12} sm={6} md={4} lg={3}>
            <Box sx={{ position: "relative" }}>
              <Card sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: 3
                },
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{room.roomNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">Type: {room.roomType}</Typography>
                  <Typography variant="body2" color="text.secondary">Beds: {room.totalBeds}</Typography>
                </CardContent>

                <Box display="flex" justifyContent="flex-end" p={1}>
                  <IconButton size="small" color="primary" onClick={() => handleEdit(room)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <Popconfirm
                    title="Delete Room"
                    description={`Are you sure you want to delete room ${room.roomNumber}?`}
                    onConfirm={() => handleDelete(room)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                    disabled={deletingId === room.id}
                  >
                    <IconButton size="small" color="error" disabled={deletingId === room.id}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Popconfirm>
                </Box>
              </Card>

              {/* Overlay for Manage Beds */}
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
                <Button variant="contained" color="secondary" onClick={() => setSelectedRoom(room)}>
                  Manage Beds
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {rooms.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No rooms found. Add a new room to get started.
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{isEditMode ? "Edit Room" : "Add New Room"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  error={!!errors.roomNumber}
                  helperText={errors.roomNumber}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Room Type"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  error={!!errors.roomType}
                  helperText={errors.roomType}
                  required
                >
                  {roomTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Beds"
                  name="totalBeds"
                  value={formData.totalBeds}
                  onChange={handleChange}
                  error={!!errors.totalBeds}
                  helperText={errors.totalBeds}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditMode ? "Update Room" : "Save Room"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <LoadingOverlay open={loading} />
    </Box>
  );
}
