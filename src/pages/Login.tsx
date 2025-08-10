import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthUrl, API_CONFIG, buildHeaders } from '@/config/apiConfig';
interface AuthResponse {
  AuthenticationResult: {
    AccessToken: string;
    ExpiresIn: number;
    IdToken: string;
    RefreshToken: string;
    TokenType: string;
  };
  ChallengeParameters: {};
}
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(getAuthUrl(), {
        method: 'POST',
        headers: buildHeaders('POST', true),
        body: JSON.stringify({
          username,
          password
        })
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const data: AuthResponse = await response.json();

      // Store tokens via token manager
      try {
        const { saveLoginTokensFromResponse } = await import('../services/httpClient');
        saveLoginTokensFromResponse(data);
      } catch {}

      // Maintain legacy localStorage for compatibility (optional)
      localStorage.setItem('accessToken', data.AuthenticationResult.AccessToken);
      localStorage.setItem('refreshToken', data.AuthenticationResult.RefreshToken);
      localStorage.setItem('idToken', data.AuthenticationResult.IdToken);
      localStorage.setItem('tokenExpiry', (Date.now() + data.AuthenticationResult.ExpiresIn * 1000).toString());
      
      // Update authentication state with role-based login
      login(data.AuthenticationResult.AccessToken);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-0">
      <div className="w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-xl border-0">
          <CardHeader className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <img 
                src="/nivasa-logo.png" 
                alt="Nivasa Finance Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-muted-foreground text-base">Sign in to your account</p>
          </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} className="pl-10" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Login;