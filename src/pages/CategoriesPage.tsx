/**
 * CategoriesPage - Route Controller for #/categories
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ScreenType } from '../types/navigation';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = useCallback((screen: ScreenType, eventId?: string) => {
    if (screen === 'detail') {
      navigate(`/event/${eventId || 'coldplay-2026'}`);
    } else if (screen === 'discover') {
      navigate('/');
    } else {
      navigate(`/${screen}`);
    }
  }, [navigate]);

  return <CategoriesScreen onNavigate={handleNavigate} />;
};

export default CategoriesPage;
