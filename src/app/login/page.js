'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch available branches
    async function fetchBranches() {
      try {
        const response = await fetch('/api/branches');
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    }
    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
      branch,
    });

    if (result.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        </CardHeader>
        
        {error && (
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                id="branch"
                value={branch}
                onValueChange={(value) => setBranch(value)}
                required
              >
                <SelectTrigger>
                  <span>{branch ? branches.find(b => b._id === branch)?.name : 'Select a branch'}</span>
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <Link 
              href="/register" 
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Don&apos;t have an account? Register
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
