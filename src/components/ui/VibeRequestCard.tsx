import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from './avatar'; // Assuming this path is correct
import { Badge } from './badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { VibeRequest } from '../../types/vibeRequest'; // Import the VibeRequest interface
import { UserProfileData } from '../../types/user'; // Import UserProfileData interface
import { formatDistanceToNow } from 'date-fns'; // For formatting created_at

interface VibeRequestCardProps {
  request: VibeRequest;
}

const VibeRequestCard: React.FC<VibeRequestCardProps> = ({ request }) => {
  const [requesterProfile, setRequesterProfile] = useState<Partial<UserProfileData> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!request.user_id) {
      setLoadingProfile(false);
      setRequesterProfile(null); // Or some default anonymous profile
      return;
    }

    const fetchRequesterProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', request.user_id)
          .single();

        if (error) {
          throw error;
        }
        setRequesterProfile(data);
      } catch (err: any) {
        console.error('Error fetching requester profile:', err);
        setProfileError('Failed to load profile.');
        setRequesterProfile(null); // Ensure requesterProfile is null on error
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchRequesterProfile();
  }, [request.user_id]);

  const getStatusColor = (status: VibeRequest['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-500 hover:bg-green-600';
      case 'in progress':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getTypeColor = (type: VibeRequest['type']) => {
    switch (type) {
      case 'request':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'challenge':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  }

  return (
    <Link to={`/idea-board/${request.id}`} className="block hover:no-underline">
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <CardHeader>
          <CardTitle className="truncate">{request.title}</CardTitle>
          <CardDescription>
            {loadingProfile && <p>Loading profile...</p>}
            {profileError && <p className="text-red-500">{profileError}</p>}
            {!loadingProfile && !profileError && requesterProfile && (
              <Link to={`/profile/${requesterProfile.user_id}`} className="flex items-center space-x-2 hover:underline" onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={requesterProfile.username || undefined} alt={requesterProfile.username || 'User'} />
                  <AvatarFallback>{requesterProfile.username ? requesterProfile.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <span>{requesterProfile.username || 'Anonymous User'}</span>
              </Link>
            )}
            {!loadingProfile && !profileError && !requesterProfile && (
               <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span>Anonymous User</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-gray-700 mb-3">
            {request.description}
          </p>
          {request.tags && request.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {request.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(request.status)} text-white`}>{request.status}</Badge>
            <Badge className={`${getTypeColor(request.type)} text-white`}>{request.type}</Badge>
          </div>
          <span>
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export { VibeRequestCard };
