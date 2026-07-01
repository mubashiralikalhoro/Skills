import React, { useEffect, useState } from "react";

const usePersistedState = <T>(key: string, initialValue: any) => {
  const [state, setState] = useState<T>(() => {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  return [state, setState] as [T, (state: ((data: T) => any) | T) => any];
};

export default usePersistedState;
