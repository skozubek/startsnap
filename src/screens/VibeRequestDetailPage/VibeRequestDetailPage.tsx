import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { VibeRequest } from '../../types/vibeRequest';
import { UserProfileData } from '../../types/user';
import { StartSnapProject } from '../../types/startsnap'; // Assuming this type exists
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog'; // Assuming this component exists
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'; // For status change
import { StartSnapCard } from '../../components/ui/StartSnapCard'; // Assuming this component exists
import { getCategoryDisplay } from '../../config/categories';
import { format } from 'date-fns';

const formatDate = (date: string) => date; // TODO: Replace with real formatting if needed

const VibeRequestDetailPage: React.FC = () => {
  const { id: requestId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [vibeRequest, setVibeRequest] = useState<VibeRequest | null>(null);
  const [requesterProfile, setRequesterProfile] = useState<Partial<UserProfileData> | null>(null);
  const [linkedStartSnap, setLinkedStartSnap] = useState<StartSnapProject | null>(null); // Use specific type
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (!requestId) {
      setError('Request ID is missing.');
      setLoading(false);
      return;
    }

    const fetchVibeRequestDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Vibe Request
        const { data: requestData, error: requestError } = await supabase
          .from('vibe_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (requestError) throw requestError;
        if (!requestData) throw new Error('Vibe Request not found.');
        setVibeRequest(requestData);

        // Fetch Requester Profile
        if (requestData.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', requestData.user_id)
            .single();
          if (profileError) console.warn('Failed to fetch requester profile:', profileError.message);
          setRequesterProfile(profileData);
        }

        // Fetch Linked StartSnap
        if (requestData.linked_startsnap_id) {
          const { data: snapData, error: snapError } = await supabase
            .from('startsnaps') // Assuming table name is 'startsnaps'
            .select('*') // Adjust select query as needed for StartSnapCard
            .eq('id', requestData.linked_startsnap_id)
            .single();
          if (snapError) console.warn('Failed to fetch linked StartSnap:', snapError.message);
          setLinkedStartSnap(snapData);
        }

      } catch (err: any) {
        setError(err.message || 'Failed to fetch vibe request details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVibeRequestDetails();
  }, [requestId]);

  useEffect(() => {
    if (!authLoading && currentUser && vibeRequest) {
      setIsOwner(currentUser.id === vibeRequest.user_id);
    } else {
      setIsOwner(false);
    }
  }, [currentUser, vibeRequest, authLoading]);

  const handleDeleteRequest = async () => {
    if (!vibeRequest || !isOwner) return;
    try {
      const { error: deleteError } = await supabase
        .from('vibe_requests')
        .delete()
        .eq('id', vibeRequest.id);
      if (deleteError) throw deleteError;
      navigate('/idea-board');
    } catch (err: any) {
      setError('Failed to delete request: ' + err.message);
      console.error(err);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Placeholder for status change - implement fully with Select if needed
  const handleStatusChange = async (newStatus: VibeRequest['status']) => {
    if (!vibeRequest || !isOwner) return;
    setLoading(true);
    try {
      const { data, error: updateError } = await supabase
        .from('vibe_requests')
        .update({ status: newStatus })
        .eq('id', vibeRequest.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setVibeRequest(data); // Update local state with the new request data
    } catch (err: any) {
      setError('Failed to update status: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  if (loading || authLoading) return <div className="container mx-auto p-4 text-center">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  if (!vibeRequest) return <div className="container mx-auto p-4 text-center">Vibe Request not found.</div>;

  const { title, description, tags, status, type, created_at } = vibeRequest;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-bold">{title}</CardTitle>
            {isOwner && (
              <div className="flex space-x-2">
                <Link to={`/idea-board/${vibeRequest.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
              </div>
            )}
          </div>
          <CardDescription className="mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              {requesterProfile ? (
                <Link to={`/profile/${requesterProfile.user_id}`} className="flex items-center space-x-2 hover:underline">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={requesterProfile.username || undefined} />
                    <AvatarFallback>{requesterProfile.username ? requesterProfile.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{requesterProfile.username || 'Anonymous'}</span>
                </Link>
              ) : (
                <span>By Anonymous</span>
              )}
              <span>&bull;</span>
              <span>{format(new Date(created_at), 'PPpp')}</span>
            </div>
            <div className="flex space-x-2">
                <Badge variant={type === 'challenge' ? 'destructive' : 'secondary'}>{type}</Badge>
                <Badge variant={status === 'open' ? 'default' : status === 'in progress' ? 'outline' : 'secondary' } className={status === 'open' ? 'bg-green-500 text-white' : status === 'in progress' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white' }>{status}</Badge>
            </div>
             {/* Basic Status Changer for Owner */}
            {isOwner && (
              <div className="mt-4">
                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">Change Status:</label>
                <select
                  id="status-select"
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as VibeRequest['status'])}
                  className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap mt-4 mb-6">{description}</p>
          {tags && tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
            </div>
          )}

          {!isOwner && currentUser && status === 'open' && (
             <div className="mt-6 space-x-2">
                <Button onClick={() => handleStatusChange('in progress')}>I'm working on this!</Button>
                {/* <Button variant="outline" onClick={() => alert("Link StartSnap UI to be implemented")}>Link my StartSnap</Button> */}
             </div>
          )}
        </CardContent>
        {linkedStartSnap && (
          <CardFooter className="flex-col items-start">
            <h3 className="text-xl font-semibold mb-3">Linked StartSnap:</h3>
            <StartSnapCard
              startsnap={linkedStartSnap}
              formatDate={formatDate}
              getCategoryDisplay={getCategoryDisplay}
            />
          </CardFooter>
        )}
      </Card>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteRequest}
        title="Delete Vibe Request"
        description="Are you sure you want to delete this vibe request? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default VibeRequestDetailPage;
