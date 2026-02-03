"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icon, IconName } from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  joinedAt: string;
  lastActive?: string;
}

const roleConfig = {
  owner: { label: 'Owner', color: 'bg-purple-100 text-purple-700', icon: 'crown' as IconName },
  admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700', icon: 'shield' as IconName },
  member: { label: 'Member', color: 'bg-gray-100 text-gray-700', icon: 'user' as IconName },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-600', icon: 'eye' as IconName },
};

const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@acmecleaning.com',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2 mins ago',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@acmecleaning.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-06-10',
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@acmecleaning.com',
    role: 'member',
    status: 'active',
    joinedAt: '2024-09-22',
    lastActive: '3 days ago',
  },
  {
    id: '4',
    name: 'pending@example.com',
    email: 'pending@example.com',
    role: 'member',
    status: 'pending',
    joinedAt: '2024-01-28',
  },
];

export default function TeamSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member',
    message: '',
  });

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteData.email) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address.',
        variant: 'destructive',
      });
      return;
    }
    
    setInviting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteData.email,
      email: inviteData.email,
      role: inviteData.role as TeamMember['role'],
      status: 'pending',
      joinedAt: new Date().toISOString(),
    };
    
    setMembers(prev => [...prev, newMember]);
    
    toast({
      title: 'Invitation sent',
      description: `An invitation has been sent to ${inviteData.email}`,
    });
    
    setInviting(false);
    setShowInviteDialog(false);
    setInviteData({ email: '', role: 'member', message: '' });
  };

  const handleRemoveMember = async (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: 'Member removed',
      description: 'The team member has been removed.',
    });
    setShowRemoveDialog(null);
  };

  const handleChangeRole = async (memberId: string, newRole: TeamMember['role']) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
    toast({
      title: 'Role updated',
      description: 'The team member\'s role has been updated.',
    });
  };

  const handleResendInvite = async (email: string) => {
    toast({
      title: 'Invitation resent',
      description: `A new invitation has been sent to ${email}`,
    });
  };

  const activeCount = members.filter(m => m.status === 'active').length;
  const pendingCount = members.filter(m => m.status === 'pending').length;

  return (
    <Layout title="Team Settings">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-900">Team</h1>
              <p className="text-gray-500">Manage your team members and permissions</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="gap-2 rounded-xl ring-2 ring-white/30"
          >
            <Icon name="userPlus" size="sm" />
            Invite Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 rounded-xl ring-1 ring-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon name="users" size="lg" className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                <p className="text-xs text-gray-500">Total Members</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 rounded-xl ring-1 ring-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Icon name="checkCircle" size="lg" className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 rounded-xl ring-1 ring-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Icon name="clock" size="lg" className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 rounded-xl ring-1 ring-white/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Icon name="shield" size="lg" className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{members.filter(m => m.role === 'admin').length + 1}</p>
                <p className="text-xs text-gray-500">Admins</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Members List */}
        <Card className="rounded-2xl ring-1 ring-white/50 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredMembers.map((member) => {
              const role = roleConfig[member.role];
              
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#9D96FF] flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{member.name}</p>
                      {member.status === 'pending' && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    {member.lastActive && member.status === 'active' && (
                      <p className="text-xs text-gray-400">Last active: {member.lastActive}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={cn("border-0", role.color)}>
                      <Icon name={role.icon} size="xs" className="mr-1" />
                      {role.label}
                    </Badge>
                    
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg">
                            <Icon name="moreVertical" size="sm" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem 
                            className="rounded-lg"
                            onClick={() => handleChangeRole(member.id, 'admin')}
                            disabled={member.role === 'admin'}
                          >
                            <Icon name="shield" size="sm" className="mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-lg"
                            onClick={() => handleChangeRole(member.id, 'member')}
                            disabled={member.role === 'member'}
                          >
                            <Icon name="user" size="sm" className="mr-2" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-lg"
                            onClick={() => handleChangeRole(member.id, 'viewer')}
                            disabled={member.role === 'viewer'}
                          >
                            <Icon name="eye" size="sm" className="mr-2" />
                            Make Viewer
                          </DropdownMenuItem>
                          {member.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="rounded-lg"
                                onClick={() => handleResendInvite(member.email)}
                              >
                                <Icon name="send" size="sm" className="mr-2" />
                                Resend Invite
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => setShowRemoveDialog(member.id)}
                          >
                            <Icon name="trash" size="sm" className="mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredMembers.length === 0 && (
              <div className="p-12 text-center">
                <Icon name="users" size="2xl" className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-medium text-gray-900 mb-1">No members found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search</p>
              </div>
            )}
          </div>
        </Card>

        {/* Permissions Info */}
        <Card className="p-6 rounded-2xl bg-blue-50/50 border-blue-100 ring-1 ring-white/50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="info" size="lg" className="text-blue-600" />
            Role Permissions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(roleConfig).map(([key, config]) => (
              <div key={key} className="p-4 rounded-xl bg-white border border-gray-100">
                <Badge className={cn("mb-2 border-0", config.color)}>
                  <Icon name={config.icon} size="xs" className="mr-1" />
                  {config.label}
                </Badge>
                <ul className="text-xs text-gray-600 space-y-1 mt-2">
                  {key === 'owner' && (
                    <>
                      <li>• Full access to all features</li>
                      <li>• Manage billing & subscription</li>
                      <li>• Delete organization</li>
                    </>
                  )}
                  {key === 'admin' && (
                    <>
                      <li>• Manage team members</li>
                      <li>• Access all quotes & customers</li>
                      <li>• Configure settings</li>
                    </>
                  )}
                  {key === 'member' && (
                    <>
                      <li>• Create & manage quotes</li>
                      <li>• View customers</li>
                      <li>• Send messages</li>
                    </>
                  )}
                  {key === 'viewer' && (
                    <>
                      <li>• View quotes & analytics</li>
                      <li>• Read-only access</li>
                      <li>• Export reports</li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@example.com"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Personal Message (optional)</Label>
              <textarea
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Hey! I'd like you to join our team..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviting} className="rounded-xl ring-2 ring-white/30">
              {inviting ? (
                <>
                  <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Icon name="send" size="sm" className="mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!showRemoveDialog} onOpenChange={() => setShowRemoveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the member from your team. They will lose access to all team resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showRemoveDialog && handleRemoveMember(showRemoveDialog)}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
