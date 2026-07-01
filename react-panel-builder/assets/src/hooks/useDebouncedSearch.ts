import React, { useEffect, useState } from 'react';

const useDebouncedSearch = (callback: (search: string) => any) => {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== null) callback(debouncedSearch);
  }, [debouncedSearch]);

  return {
    search,
    setSearch,
  };
};

export default useDebouncedSearch;
