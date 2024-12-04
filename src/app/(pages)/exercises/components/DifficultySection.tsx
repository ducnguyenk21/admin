import React from "react";
import { Box, TextField, Chip } from "@mui/material";
import { pink } from "@mui/material/colors";

interface DifficultySectionProps {
  level: "Beginner" | "Normal" | "Professional";
  difficulty: {
    Beginner: { calo: number; rep: number; time: number };
    Normal: { calo: number; rep: number; time: number };
    Professional: { calo: number; rep: number; time: number };
  };
  setDifficulty: React.Dispatch<
    React.SetStateAction<{
      Beginner: { calo: number; rep: number; time: number };
      Normal: { calo: number; rep: number; time: number };
      Professional: { calo: number; rep: number; time: number };
    }>
  >;
}

export const DifficultySection: React.FC<DifficultySectionProps> = ({
  level,
  difficulty,
  setDifficulty,
}) => {
  const handleChange =
    (field: keyof (typeof difficulty)[typeof level]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value)) {
        setDifficulty((prev) => ({
          ...prev,
          [level]: {
            ...prev[level],
            [field]: value,
          },
        }));
      }
    };

  // Define colors based on difficulty level
  const levelColors = {
    Beginner: {
      backgroundColor: "#e0f7fa",
      color: "#00796b",
    },
    Normal: {
      //backgroundColor: "#F3CFCE",
      backgroundColor: "#FFD8B2",
      color: "brown",
    },
    Professional: {
      backgroundColor: "#D16B75", // Blue
      color: "#562C30", // Dark Blue
    },
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      border={`1px solid ${levelColors[level].color}`} // Apply border color dynamically
      borderRadius="10px"
      padding="4px"
      marginTop="8px"
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap="45px"
        padding="8px"
      >
        <Chip
          label={`Độ khó: ${level}`}
          variant="outlined"
          sx={{
            backgroundColor: levelColors[level].backgroundColor,
            color: levelColors[level].color,
            fontWeight: "bold",
            fontSize: "16px",
            padding: "10px 16px",
            height: "43px",
            width: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "25px",
            marginTop: "5px",
          }}
        />

        <TextField
          margin="dense"
          label="Thời gian (s)"
          fullWidth
          variant="outlined"
          size="small"
          required
          value={difficulty[level].time}
          onChange={handleChange("time")}
        />
      </Box>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        gap="20px"
        padding="8px"
      >
        <TextField
          margin="dense"
          label="Số Calo"
          variant="outlined"
          fullWidth
          size="small"
          required
          value={difficulty[level].calo}
          onChange={handleChange("calo")}
        />

        <TextField
          margin="dense"
          label="Số Rep"
          variant="outlined"
          fullWidth
          size="small"
          required
          value={difficulty[level].rep}
          onChange={handleChange("rep")}
        />
      </Box>
    </Box>
  );
};

export default DifficultySection;
