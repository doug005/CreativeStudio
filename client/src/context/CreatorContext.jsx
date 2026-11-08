import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const CreatorContext = createContext(null);
export function CreatorProvider({ children }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => { api('/creator').then(setProfile).catch(() => {}); }, []);
  return <CreatorContext.Provider value={profile}>{children}</CreatorContext.Provider>;
}
export function useCreatorProfile() { return useContext(CreatorContext); }
