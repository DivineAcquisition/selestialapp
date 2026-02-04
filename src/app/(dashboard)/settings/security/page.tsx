"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/providers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const mockSessions: Session[] = [
  {
    id: '1',
    device: 'Windows PC',
    browser: 'Chrome 120',
    location: 'Los Angeles, CA',
    lastActive: 'Now',
    current: true,
  },
  {
    id: '2',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    location: 'Los Angeles, CA',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: '3',
    device: 'MacBook Pro',
    browser: 'Firefox 121',
    location: 'San Francisco, CA',
    lastActive: '3 days ago',
    current: false,
  },
];

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    
    setChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Error updating password',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({
      title: 'Session revoked',
      description: 'The device has been logged out.',
    });
  };

  const handleRevokeAllSessions = async () => {
    setSessions(prev => prev.filter(s => s.current));
    toast({
      title: 'All sessions revoked',
      description: 'All other devices have been logged out.',
    });
  };

  return (
    <Layout title="Security Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/settings')}
            className="rounded-xl"
          >
            <Icon name="arrowLeft" size="lg" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security</h1>
            <p className="text-gray-500">Manage your account security and sessions</p>
          </div>
        </div>

        {/* Password */}
        <Card className="p-6 rounded-2xl ring-1 ring-white/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon name="key" size="xl" className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Last changed 30 days ago</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
              className="rounded-xl"
            >
              <Icon name="edit" size="sm" className="mr-2" />
              Change Password
            </Button>
          </div>
          
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
            <Icon name="alertCircle" size="sm" className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Password recommendations</p>
              <ul className="text-xs text-amber-700 mt-1 space-y-1">
                <li>• Use at least 12 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Add numbers and special characters</li>
                <li>• Don&apos;t reuse passwords from other sites</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-6 rounded-2xl ring-1 ring-white/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <Icon name="shield" size="xl" className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                {twoFactorEnabled ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">
                    <Icon name="check" size="xs" className="mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-0">
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button
              variant={twoFactorEnabled ? 'outline' : 'default'}
              onClick={() => setShowTwoFactorDialog(true)}
              className={cn("rounded-xl", !twoFactorEnabled && "ring-2 ring-white/30")}
            >
              {twoFactorEnabled ? 'Manage' : 'Enable'}
            </Button>
          </div>
        </Card>

        {/* Active Sessions */}
        <Card className="p-6 rounded-2xl ring-1 ring-white/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Icon name="monitor" size="xl" className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Active Sessions</h3>
                <p className="text-sm text-gray-500">{sessions.length} device{sessions.length !== 1 ? 's' : ''} logged in</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50">
                  Sign out all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out all other devices?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign you out of all other devices except this one.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevokeAllSessions} className="rounded-xl bg-red-600 hover:bg-red-700">
                    Sign out all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border",
                  session.current ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-100"
                )}
              >
                <div className="p-2 rounded-lg bg-white">
                  <Icon
                    name={session.device.includes('iPhone') || session.device.includes('Android') ? 'smartphone' : 'laptop'}
                    size="lg"
                    className="text-gray-600"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-gray-400">Last active: {session.lastActive}</p>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Login History */}
        <Card className="p-6 rounded-2xl ring-1 ring-white/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gray-100">
              <Icon name="history" size="xl" className="text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Login History</h3>
              <p className="text-sm text-gray-500">Recent login activity on your account</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { date: 'Today, 2:34 PM', location: 'Los Angeles, CA', device: 'Chrome on Windows', success: true },
              { date: 'Yesterday, 9:12 AM', location: 'Los Angeles, CA', device: 'Safari on iPhone', success: true },
              { date: 'Jan 30, 11:45 PM', location: 'Unknown', device: 'Firefox on Linux', success: false },
            ].map((login, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Icon
                  name={login.success ? 'checkCircle' : 'xCircle'}
                  size="sm"
                  className={login.success ? 'text-emerald-500' : 'text-red-500'}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{login.date}</p>
                  <p className="text-xs text-gray-500">{login.device} • {login.location}</p>
                </div>
                {!login.success && (
                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                    Failed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 rounded-2xl border-red-200 bg-red-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <Icon name="alertTriangle" size="xl" className="text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-100">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl bg-red-600 hover:bg-red-700">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={changingPassword} className="rounded-xl ring-2 ring-white/30">
              {changingPassword ? (
                <>
                  <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {twoFactorEnabled 
                ? 'Manage your two-factor authentication settings.'
                : 'Add an extra layer of security to your account.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Icon name="qrCode" size="4xl" className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Scan this QR code with your authenticator app
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                placeholder="Enter 6-digit code"
                className="rounded-xl text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setTwoFactorEnabled(true);
                setShowTwoFactorDialog(false);
                toast({ title: 'Two-factor authentication enabled' });
              }} 
              className="rounded-xl ring-2 ring-white/30"
            >
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
