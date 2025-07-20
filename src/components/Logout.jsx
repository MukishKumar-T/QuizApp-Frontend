import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Clear any auth state here if needed
    navigate('/'); // Go to landing page
  }, [navigate]);
  return null;
};

export default Logout;