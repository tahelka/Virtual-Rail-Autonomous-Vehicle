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
} from "@mui/material";

const ManageMaps = () => {
  const [vertices, setVertices] = useState([]);
  const [vertexId, setVertexId] = useState("");
  const [connectedVertexId, setConnectedVertexId] = useState("");
  const [direction, setDirection] = useState("");

  const handleVertexIdChange = (event) => {
    setVertexId(event.target.value);
  };

  const handleConnectedVertexIdChange = (event) => {
    setConnectedVertexId(event.target.value);
  };

  const handleDirectionChange = (event) => {
    setDirection(event.target.value);
  };

  const handleAddEdge = () => {
    if (
      vertexId.trim() === "" ||
      connectedVertexId.trim() === "" ||
      direction === ""
    ) {
      alert(
        "Please fill all fields (Vertex ID, Connected Vertex ID, Direction)"
      );
      return;
    }

    const updatedVertices = vertices.map((vertex) => {
      if (vertex.id === vertexId) {
        const existingEdgeIndex = vertex.edges.findIndex(
          (edge) => edge.vertex === connectedVertexId
        );
        if (existingEdgeIndex !== -1) {
          alert("An edge with this vertex already exists.");
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

  const handleSaveMap = () => {
    console.log(vertices);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Manage Maps
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
    </div>
  );
};

export default ManageMaps;
