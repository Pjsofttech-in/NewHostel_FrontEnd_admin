import React from "react";
import { Box } from "@mui/material";
import { Trefoil } from "ldrs/react";
import "ldrs/react/Trefoil.css";

const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        zIndex: 1400, // higher than MUI dialog
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(4px)",
        pointerEvents: "auto", // allow blocking interactions
      }}
    >
      <Trefoil
        size="80"
        stroke="8"
        strokeLength="0.15"
        bgOpacity="0.35"
        speed="1.4"
        color="#2980B9"
      />
    </Box>
  );
};

export default LoadingOverlay;
