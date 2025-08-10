import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, CheckCircle, XCircle } from 'lucide-react';

/**
 * Component to display current user's role and permissions
 * Useful for debugging and development
 */
export const UserRoleDisplay: React.FC = () => {
  const { userInfo, userRoles, primaryRole, permissions } = useAuth();

  if (!userInfo) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Details */}
        <div>
          <h4 className="font-semibold mb-2">User Details</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Username:</strong> {userInfo.username}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Email Verified:</strong> {userInfo.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Roles */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </h4>
          <div className="flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <Badge 
                key={role} 
                variant={role === primaryRole ? "default" : "secondary"}
                className="text-xs"
              >
                {role}
                {role === primaryRole && " (Primary)"}
              </Badge>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <h4 className="font-semibold mb-2">Permissions</h4>
          <div className="space-y-1 text-sm">
            {Object.entries(permissions).map(([permission, hasPermission]) => (
              <div key={permission} className="flex items-center gap-2">
                {hasPermission ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={hasPermission ? "text-green-700" : "text-red-700"}>
                  {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 