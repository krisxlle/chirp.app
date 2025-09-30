import { ArrowLeft, BarChart3, LogOut, Save, Settings, Shield, User } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import UserAvatar from '../components/UserAvatar';

export default function Settings() {
  const { user, signOut, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkInBio, setLinkInBio] = useState(user?.linkInBio || '');

  // Analytics data
  const [analyticsData] = useState({
    profilePower: 1250,
    totalChirps: 42,
    totalLikes: 1250,
    totalComments: 89,
    followers: 320,
    following: 150,
    accountAge: 365,
    engagementRate: 8.5,
    topChirp: {
      content: 'Just shipped a new feature to Chirp! ✨',
      likes: 42,
      replies: 8,
      reposts: 12
    }
  });

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      await updateUser({
        firstName,
        bio,
        linkInBio
      });
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <UserAvatar user={user} size="lg" />
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkInBio">Link in Bio</Label>
                  <Input
                    id="linkInBio"
                    value={linkInBio}
                    onChange={(e) => setLinkInBio(e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isUpdating}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Profile Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analyticsData.profilePower}</div>
                      <div className="text-sm text-gray-600">Profile Power</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.totalChirps}</div>
                      <div className="text-sm text-gray-600">Total Chirps</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analyticsData.totalLikes}</div>
                      <div className="text-sm text-gray-600">Total Likes</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{analyticsData.totalComments}</div>
                      <div className="text-sm text-gray-600">Total Comments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Followers</span>
                      <span className="font-semibold">{analyticsData.followers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Following</span>
                      <span className="font-semibold">{analyticsData.following}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Engagement Rate</span>
                      <span className="font-semibold">{analyticsData.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Age</span>
                      <span className="font-semibold">{analyticsData.accountAge} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Chirp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-700">{analyticsData.topChirp.content}</p>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>{analyticsData.topChirp.likes} likes</span>
                      <span>{analyticsData.topChirp.replies} replies</span>
                      <span>{analyticsData.topChirp.reposts} reposts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Account Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled />
                    <p className="text-sm text-gray-500">
                      Contact support to change your email address
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-semibold text-red-800 mb-2">Sign Out</h3>
                      <p className="text-sm text-red-600 mb-3">
                        Sign out of your account on this device
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={handleSignOut}
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}