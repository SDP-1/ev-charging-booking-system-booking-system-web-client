import React from 'react';
import { useNavigate } from 'react-router-dom';
import StationDetailsModal from '../components/common/StationDetailsModal';

const StationDetails = () => {
  const navigate = useNavigate();

  return (
    // Render the modal; onClose we go back to the stations list
    <StationDetailsModal onClose={() => navigate('/dashboard/stations')} />
  );
};

export default StationDetails;
