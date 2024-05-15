/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import StyledButton from "../components/StyledButton";
import MapManagement from "../components/Admin/MapManagement";
import CarManagement from "../components/Admin/CarManagement";

function Admin() {
  const [showMapManagement, setShowMapManagement] = useState(false);
  const [showCarManagement, setShowCarManagement] = useState(false);

  const handleMapManagementClick = () => {
    setShowMapManagement(true);
    setShowCarManagement(false);
  };

  const handleCarManagementClick = () => {
    setShowCarManagement(true);
    setShowMapManagement(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <StyledButton onClick={handleMapManagementClick}>MANAGE MAPS</StyledButton>
        <StyledButton onClick={handleCarManagementClick}>MANAGE CARS</StyledButton>
      </div>

      <div style={{ minHeight: '10rem', backgroundColor: "lightgray",borderRadius: '0.4rem'}}>    
        {showMapManagement && <MapManagement />}
        {showCarManagement && <CarManagement />}
      </div>
    </div>
  );
}

export default Admin;