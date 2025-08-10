// JWT Token Types for AWS Cognito
export interface CognitoJwtPayload {
  sub: string; // User ID
  aud: string; // Audience
  email_verified: boolean;
  event_id: string;
  token_use: string;
  auth_time: number;
  iss: string; // Issuer
  'cognito:username': string;
  exp: number; // Expiration time
  iat: number; // Issued at
  email: string;
  'cognito:groups'?: string[]; // User roles/groups
  [key: string]: any; // Additional claims
}

// User Role Types - Dynamic from Cognito groups
export type UserRole = string;

// Role Permissions Interface - Flexible for any permission
export interface RolePermissions {
  [key: string]: boolean;
}

// Default permissions for when no specific permissions are defined
export const DEFAULT_PERMISSIONS: RolePermissions = {}; 