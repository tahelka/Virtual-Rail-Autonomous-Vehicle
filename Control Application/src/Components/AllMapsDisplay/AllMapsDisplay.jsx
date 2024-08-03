import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";

const AllMapsDisplay = () => {
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    // Fetch data from API using Axios
    axios
      .get("http://localhost:5000/api/maps")
      .then((response) => {
        setMaps(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleDelete = (mapId) => {
    // Perform delete operation using Axios
    axios
      .delete(`http://localhost:5000/api/maps/${mapId}`)
      .then((response) => {
        console.log(`Map with ID ${mapId} deleted successfully.`);
        // Update state or handle any other action after deletion
      })
      .catch((error) => {
        console.error(`Error deleting map with ID ${mapId}:`, error);
      });
  };

  return (
    <Grid container spacing={2}>
      <Grid item>
        <Typography variant="h5" gutterBottom>
          All available maps
        </Typography>
      </Grid>
      {maps.map((map) => (
        <Grid item key={map.id} xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Map ID: {map.id}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Creation Time:{" "}
                {new Date(map.creation_time * 1000).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Data:</strong>
                <ul>
                  {map.data.map((item) => (
                    <li key={item.id}>
                      Vertex {item.id}
                      <ul>
                        {item.edges.map((edge, index) => (
                          <li key={index}>
                            {/* Direction: {edge.direction}, Vertex: {edge.vertex} */}
                            {edge.vertex} connected from {edge.direction}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="error" // You can adjust the color as per your theme
                onClick={() => handleDelete(map.id)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AllMapsDisplay;
