import { jwtDecode } from 'jwt-decode';
import { CognitoJwtPayload, UserRole, DEFAULT_PERMISSIONS, RolePermissions } from '@/types/jwt';

/**
 * Decode JWT token and extract user information
 */
export const decodeJwtToken = (token: string): CognitoJwtPayload | null => {
  try {
    return jwtDecode<CognitoJwtPayload>(token);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Extract user roles from JWT token
 */
export const extractUserRoles = (token: string): UserRole[] => {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded['cognito:groups']) {
    return []; // No default role - let the application decide
  }
  
  // Return all Cognito groups as roles
  return decoded['cognito:groups'];
};

/**
 * Get the first role from user roles (or empty string if no roles)
 */
export const getPrimaryRole = (roles: UserRole[]): UserRole => {
  return roles.length > 0 ? roles[0] : '';
};

/**
 * Get permissions for a specific role
 * This function can be extended to fetch permissions from an API or configuration
 */
export const getRolePermissions = (role: UserRole): RolePermissions => {
  // For now, return default permissions
  // In the future, this could fetch from an API or configuration
  return DEFAULT_PERMISSIONS;
};

/**
 * Get permissions for multiple roles (union of all permissions)
 * This function can be extended to fetch permissions from an API or configuration
 */
export const getMultiRolePermissions = (roles: UserRole[]): RolePermissions => {
  // For now, return default permissions
  // In the future, this could fetch from an API or configuration
  return DEFAULT_PERMISSIONS;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJwtToken(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get user information from token
 */
export const getUserInfo = (token: string) => {
  const decoded = decodeJwtToken(token);
  if (!decoded) return null;
  
  return {
    userId: decoded.sub,
    username: decoded['cognito:username'],
    email: decoded.email,
    emailVerified: decoded.email_verified,
  };
}; 