import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StationDetailsModal from '../components/common/StationDetailsModal';

const StationDetails = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"
    >
      <StationDetailsModal onClose={() => navigate('/dashboard/stations')} />
    </motion.div>
  );
};

export default StationDetails;