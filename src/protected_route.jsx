import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthState } from './login/auth_state';

export function ProtectedRoute({ authState, children }) {
  if (!authState || authState === AuthState.Unknown) {
    return <div>Loading...</div>;
  }

  if (authState !== AuthState.Authenticated) {
    return <Navigate to="/" replace />; 
  }
  return children;
}