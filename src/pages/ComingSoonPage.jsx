import React from 'react';
import { useLocation } from 'react-router-dom';
import ComingSoon from '../components/Common/ComingSoon';

const ComingSoonPage = () => {
  const location = useLocation();

  const getModuleTitle = (pathname) => {
    if (pathname.includes('registration')) return 'Registration';
    if (pathname.includes('abstract')) return 'Abstract';
    if (pathname.includes('users')) return 'Users';
    return 'Module';
  };

  return (
    <div className="container-fluid px-0">
      <ComingSoon moduleName={getModuleTitle(location.pathname)} />
    </div>
  );
};

export default ComingSoonPage;
