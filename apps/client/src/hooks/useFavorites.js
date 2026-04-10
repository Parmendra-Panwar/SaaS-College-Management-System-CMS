import { useState, useEffect } from 'react';

const MAX_LIMITS = {
  listing: 20,
  activity: 20,
  trip: 20
};

export const useFavorites = (itemType) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('user_favorites');
      return stored ? JSON.parse(stored) : { listing: [], activity: [], trip: [] };
    } catch (e) {
      return { listing: [], activity: [], trip: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('user_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) return;

    setFavorites(prev => {
      const currentList = prev[itemType] || [];
      const isFavorite = currentList.includes(id);

      let newList = [...currentList];

      if (isFavorite) {
        newList = newList.filter(favId => favId !== id);
      } else {
        if (newList.length >= MAX_LIMITS[itemType]) {
          alert(`You hit the limit! Max ${MAX_LIMITS[itemType]} ${itemType}s allowed.`);
          return prev;
        }
        newList.push(id);
      }

      return {
        ...prev,
        [itemType]: newList
      };
    });
  };

  const isFavorite = (id) => {
    return (favorites[itemType] || []).includes(id);
  };

  return { toggleFavorite, isFavorite };
};
