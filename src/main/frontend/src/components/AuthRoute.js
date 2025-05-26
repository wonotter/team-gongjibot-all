import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

// 인증이 필요한 라우트를 위한 컴포넌트
export const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// 비로그인 상태에서만 접근 가능한 라우트를 위한 컴포넌트 (로그인, 회원가입 페이지 등)
export const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" />;
}; 