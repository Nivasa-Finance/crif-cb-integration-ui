import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RolePermissions } from '@/types/jwt';

interface RoleBasedRenderProps {
  children: React.ReactNode;
  requiredPermissions?: Partial<RolePermissions>;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on user permissions
 */
export const RoleBasedRender: React.FC<RoleBasedRenderProps> = ({
  children,
  requiredPermissions = {},
  fallback = null,
}) => {
  const { permissions } = useAuth();

  // If no permissions are required, render children
  if (Object.keys(requiredPermissions).length === 0) {
    return <>{children}</>;
  }

  // Check if user has all required permissions
  const hasRequiredPermissions = Object.entries(requiredPermissions).every(
    ([permission, required]) => {
      const userPermission = permissions[permission as keyof RolePermissions];
      return userPermission === required;
    }
  );

  if (hasRequiredPermissions) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Hook for checking specific permissions
 */
export const usePermissions = () => {
  const { permissions } = useAuth();
  
  return {
    permissions,
    can: (permission: keyof RolePermissions): boolean => {
      return permissions[permission] || false;
    },
    canAny: (permissionsToCheck: (keyof RolePermissions)[]): boolean => {
      return permissionsToCheck.some(permission => permissions[permission]);
    },
    canAll: (permissionsToCheck: (keyof RolePermissions)[]): boolean => {
      return permissionsToCheck.every(permission => permissions[permission]);
    },
  };
}; 