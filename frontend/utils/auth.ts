'use client'

import { jwtDecode } from 'jwt-decode';

export const isValidToken = (token: string): boolean => {
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (!decodedToken.exp) return false;

    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};