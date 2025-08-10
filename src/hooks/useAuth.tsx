import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserRole, RolePermissions, DEFAULT_PERMISSIONS } from '@/types/jwt';
import { 
  extractUserRoles, 
  getPrimaryRole, 
  getMultiRolePermissions, 
  getUserInfo
} from '@/utils/jwtUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  accessToken: string | null;
  userRoles: UserRole[];
  primaryRole: UserRole;
  permissions: RolePermissions;
  userInfo: {
    userId: string;
    username: string;
    email: string;
    emailVerified: boolean;
  } | null;
  login: (token: string) => void;
  logout: () => void;
  checkTokenValidity: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<UserRole>('');
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS);
  const [userInfo, setUserInfo] = useState<{
    userId: string;
    username: string;
    email: string;
    emailVerified: boolean;
  } | null>(null);

  const checkTokenValidity = () => {
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('tokenExpiry');
    if (!token || !expiry) return false;
    const isExpired = Date.now() > parseInt(expiry);
    return !isExpired;
  };

  const bootstrapFromStorage = () => {
    const token = localStorage.getItem('accessToken');
    if (token && checkTokenValidity()) {
      setAccessToken(token);
      setIsAuthenticated(true);
      const roles = extractUserRoles(token);
      const primary = getPrimaryRole(roles);
      const userPerms = getMultiRolePermissions(roles);
      const user = getUserInfo(token);
      setUserRoles(roles);
      setPrimaryRole(primary);
      setPermissions(userPerms);
      setUserInfo(user);
    } else {
      setIsAuthenticated(false);
    }
  };

  const login = (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    const roles = extractUserRoles(token);
    const primary = getPrimaryRole(roles);
    const userPerms = getMultiRolePermissions(roles);
    const user = getUserInfo(token);
    setUserRoles(roles);
    setPrimaryRole(primary);
    setPermissions(userPerms);
    setUserInfo(user);
    setIsAuthReady(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('tokenExpiry');
    setAccessToken(null);
    setIsAuthenticated(false);
    setUserRoles([]);
    setPrimaryRole('');
    setPermissions(DEFAULT_PERMISSIONS);
    setUserInfo(null);
    setIsAuthReady(true);
  };

  useEffect(() => {
    bootstrapFromStorage();
    setIsAuthReady(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthReady,
        accessToken,
        userRoles,
        primaryRole,
        permissions,
        userInfo,
        login,
        logout,
        checkTokenValidity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};