import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Add, ArrowBack, Edit, Delete } from "@mui/icons-material";
import {
  createBed,
  getBedsByRoom,
  updateBed,
  deleteBed,
} from "../../../Services/SettingService/BedService";
import AlertService from "../../../Components/Common/AlertService";
import { useSession } from "../../Common/useSession";

const HostelBed = ({ room, onBack }) => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [formData, setFormData] = useState({
    bedNumber: "",
    bedType: "Single",
    allocated: false,
    available: true,
  });


  const { role, email } = useSession();

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const data = await getBedsByRoom(room.id, role, email);
      setBeds(data);
    } catch (error) {
      AlertService.error("Failed to load beds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, [room.id]);

  const handleOpenDialog = (bed = null) => {
    if (bed) {
      setEditingBed(bed);
      setFormData(bed);
    } else {
      setEditingBed(null);
      setFormData({ bedNumber: "", bedType: "Single", allocated: false, available: true });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.bedNumber.trim()) {
        AlertService.warn("Please enter bed number");
        return;
      }
      if (editingBed) {
        await updateBed(editingBed.id, formData, role, email);
        AlertService.success("Bed updated successfully");
      } else {
        await createBed(formData, role, email, room.id);
        AlertService.success("Bed added successfully");
      }
      setDialogOpen(false);
      fetchBeds();
    } catch {
      AlertService.error("Error saving bed");
    }
  };

  const handleDelete = async (id) => {
    AlertService.confirm("Are you sure you want to delete this bed?").then(async (confirmed) => {
      if (confirmed) {
        try {
          await deleteBed(id, role, email);
          AlertService.success("Bed deleted successfully");
          fetchBeds();
        } catch {
          AlertService.error("Error deleting bed");
        }
      }
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">
            Beds in Room: <strong>{room.roomNumber || room.name}</strong>
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Bed
        </Button>
      </Box>

      {/* Beds Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : beds.length === 0 ? (
        <Typography>No beds found for this room</Typography>
      ) : (
        <Grid container spacing={2}>
          {beds.map((bed) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={bed.id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: "#1e1e2f",
                  color: "white",
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">
                  Bed No: <strong>{bed.bedNumber}</strong>
                </Typography>
                <Typography variant="body2">Type: {bed.bedType}</Typography>
                <Box mt={1} display="flex" gap={1}>
                  <Chip
                    label={bed.allocated ? "Allocated" : "Unallocated"}
                    color={bed.allocated ? "error" : "success"}
                    size="small"
                  />
                  <Chip
                    label={bed.available ? "Available" : "Unavailable"}
                    color={bed.available ? "primary" : "default"}
                    size="small"
                  />
                </Box>
                <Box position="absolute" top={5} right={5} display="flex" gap={1}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleOpenDialog(bed)}>
                      <Edit fontSize="small" sx={{ color: "white" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(bed.id)}>
                      <Delete fontSize="small" sx={{ color: "red" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingBed ? "Edit Bed" : "Add Bed"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                label="Bed Number"
                fullWidth
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Bed Type"
                fullWidth
                value={formData.bedType}
                onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Bunk">Bunk</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingBed ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostelBed;
