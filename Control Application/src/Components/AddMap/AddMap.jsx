import { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
} from "@mui/material";
import CustomSnackbar from "../../Components/CustomSnackbar/CustomSnackbar";
import axios from "axios";

const AddMap = () => {
  const [vertices, setVertices] = useState([]);
  const [vertexId, setVertexId] = useState("");
  const [connectedVertexId, setConnectedVertexId] = useState("");
  const [direction, setDirection] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleVertexIdChange = (event) => {
    setVertexId(event.target.value);
  };

  const handleConnectedVertexIdChange = (event) => {
    setConnectedVertexId(event.target.value);
  };

  const handleDirectionChange = (event) => {
    setDirection(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleAddEdge = () => {
    if (
      vertexId.trim() === "" ||
      connectedVertexId.trim() === "" ||
      direction === ""
    ) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        "Please fill all fields (Vertex ID, Connected Vertex ID, Direction)"
      );
      setSnackbarOpen(true);
      return;
    }

    const updatedVertices = vertices.map((vertex) => {
      if (vertex.id === vertexId) {
        const existingEdgeIndex = vertex.edges.findIndex(
          (edge) => edge.vertex === connectedVertexId
        );
        if (existingEdgeIndex !== -1) {
          setSnackbarSeverity("error");
          setSnackbarMessage("An edge with this vertex already exists.");
          setSnackbarOpen(true);
          return vertex;
        }

        return {
          ...vertex,
          edges: [
            ...vertex.edges,
            {
              vertex: connectedVertexId,
              direction: direction,
            },
          ],
        };
      } else {
        return vertex;
      }
    });

    const existingVertex = vertices.find((vertex) => vertex.id === vertexId);
    if (!existingVertex) {
      setVertices([
        ...vertices,
        {
          id: vertexId,
          edges: [{ vertex: connectedVertexId, direction: direction }],
        },
      ]);
    } else {
      setVertices(updatedVertices);
    }

    setVertexId("");
    setConnectedVertexId("");
    setDirection("");
  };

  const handleSaveMap = async () => {
    try {
      // Log vertices to verify
      console.log(vertices);

      // Make sure vertices is not empty
      if (vertices.length === 0) {
        console.error("Vertices array is empty.");
        return;
      }

      // Send vertices as POST request body using Axios
      const response = await axios.post(
        "http://localhost:5000/api/maps/save",
        vertices
      );

      // Check if request was successful
      if (response.status !== 200) {
        throw new Error("Failed to save map.");
      }

      // If successful, set snackbar success message
      setSnackbarSeverity("success");
      setSnackbarMessage("Map created successfully");
      setSnackbarOpen(true);

      // Reset the state
      setVertices([]);
      setVertexId("");
      setConnectedVertexId("");
    } catch (error) {
      console.error("Error saving map:", error);
      // Set snackbar error message
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to save map");
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Add new map
      </Typography>

      {/* Form for adding edges */}
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
            label="Vertex ID"
            variant="outlined"
            size="small"
            value={vertexId}
            onChange={handleVertexIdChange}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Connected Vertex ID"
            variant="outlined"
            size="small"
            value={connectedVertexId}
            onChange={handleConnectedVertexIdChange}
          />
        </Grid>
        <Grid item>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel>Select Direction</InputLabel>
            <Select
              value={direction}
              onChange={handleDirectionChange}
              label="Select Direction"
              sx={{ minWidth: "160px" }}
            >
              <MenuItem value="north">North</MenuItem>
              <MenuItem value="south">South</MenuItem>
              <MenuItem value="east">East</MenuItem>
              <MenuItem value="west">West</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleAddEdge}>
            Add Edge
          </Button>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Grid container spacing={2} style={{ marginTop: "20px" }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleSaveMap}>
            Save Map
          </Button>
        </Grid>
      </Grid>

      {/* Display current vertices and edges */}
      {vertices.length > 0 && (
        <div>
          <Typography variant="h6" sx={{ marginTop: "20px" }}>
            Current Vertices and Edges:
          </Typography>
          <ul>
            {vertices.map((vertex) => (
              <li key={vertex.id}>
                {`Vertex ${vertex.id}`}
                <ul>
                  {vertex.edges.map((edge, index) => (
                    <li
                      key={index}
                    >{`${edge.vertex} connected from ${edge.direction}`}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CustomSnackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </div>
  );
};

export default AddMap;
