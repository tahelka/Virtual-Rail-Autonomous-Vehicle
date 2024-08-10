import React from "react";
import { useParams } from "react-router-dom";

const TripDetails = () => {
  const { tripId } = useParams();

  return (
    <div>
      <h1>Trip Details</h1>
      <p>Trip ID: {tripId}</p>
    </div>
  );
};

export default TripDetails;
