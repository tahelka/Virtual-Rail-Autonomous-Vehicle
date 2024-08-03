import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

const AllMapsDisplay = () => {
  const fetchMaps = async () => {
    const { data } = await axios.get("http://localhost:5000/api/maps");
    return data;
  };

  const {
    data: maps,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["maps"],
    queryFn: fetchMaps,
  });

  const handleDelete = (mapId) => {
    axios
      .delete(`http://localhost:5000/api/maps/delete/${mapId}`)
      .then((response) => {
        console.log(`Map with ID ${mapId} deleted successfully.`);
        // Optionally, you can refetch the data after deletion
      })
      .catch((error) => {
        console.error(`Error deleting map with ID ${mapId}:`, error);
      });
  };

  if (isLoading) {
    return <Typography variant="h6">Loading maps...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="h6">Error fetching maps: {error.message}</Typography>
    );
  }

  return (
    <Grid container spacing={2} alignItems="flex-start">
      <Grid item xs={12}>
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
              </Typography>
              <List>
                {map.data.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText primary={`Vertex ${item.id}`} />
                    <Typography variant="body2">
                      {item.edges.map((edge, index) => (
                        <span key={index}>
                          {edge.vertex} connected from {edge.direction}
                          {index !== item.edges.length - 1 && ", "}
                        </span>
                      ))}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="error" // Adjust color as per your theme
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
