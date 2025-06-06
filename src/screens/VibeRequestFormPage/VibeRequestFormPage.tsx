import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthContext } from '../../context/AuthContext';
import { VibeRequest } from '../../types/vibeRequest';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { SegmentedControl } from '../../components/ui/segmented-control'; // Assuming this exists
// For SegmentedControl, if it doesn't exist, I'll use radio buttons or a simple select.
// For now, I'll assume SegmentedControl is available and follows a similar API to Shadcn UI.

interface FormData {
  title: string;
  description: string;
  tags: string; // Comma-separated string
  type: 'request' | 'challenge';
}

const VibeRequestFormPage: React.FC = () => {
  const { id: requestId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useContext(AuthContext);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    tags: '',
    type: 'request',
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // For fetching data in edit mode
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      setIsEditMode(true);
      setLoading(true);
      const fetchRequestData = async () => {
        try {
          const { data, error: fetchError } = await supabase
            .from('vibe_requests')
            .select('*')
            .eq('id', requestId)
            .single();

          if (fetchError) throw fetchError;
          if (!data) throw new Error('Vibe Request not found.');

          if (currentUser && data.user_id !== currentUser.id) {
            setError('You are not authorized to edit this request.');
            // Or redirect: navigate('/idea-board');
            return;
          }

          setFormData({
            title: data.title,
            description: data.description,
            tags: (data.tags || []).join(', '),
            type: data.type as 'request' | 'challenge',
          });
        } catch (err: any) {
          setError(err.message || 'Failed to load vibe request data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      if (currentUser) { // Only fetch if user is loaded, to check ownership
         fetchRequestData();
      } else if (!authLoading) { // If auth is done loading and no user, then no access
         setError('You must be logged in to edit a request.');
         navigate('/idea-board'); // Or to login page
      }
    } else {
      setIsEditMode(false);
      // Reset form for create mode if user navigates from edit to new
      setFormData({ title: '', description: '', tags: '', type: 'request' });
    }
  }, [requestId, currentUser, authLoading, navigate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as 'request' | 'challenge' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to submit.');
      return;
    }
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and Description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const submissionData = {
      user_id: currentUser.id,
      title: formData.title,
      description: formData.description,
      tags: tagsArray,
      type: formData.type,
      // status is defaulted by DB or handled separately if needed in form
    };

    try {
      let resultRequestId = requestId;
      if (isEditMode) {
        const { data, error: updateError } = await supabase
          .from('vibe_requests')
          .update(submissionData)
          .eq('id', requestId)
          .select('id')
          .single();
        if (updateError) throw updateError;
        if (!data) throw new Error("Update failed or returned no data.");
      } else {
        const { data, error: insertError } = await supabase
          .from('vibe_requests')
          .insert(submissionData)
          .select('id')
          .single();
        if (insertError) throw insertError;
        if (!data) throw new Error("Insert failed or returned no data.");
        resultRequestId = data.id;
      }
      navigate(`/idea-board/${resultRequestId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="container mx-auto p-4 text-center">Loading authentication...</div>;
  }

  if (!currentUser && !authLoading) {
    // This will redirect if not logged in.
    // Consider showing a login prompt or redirecting to a login page.
    return <Navigate to="/idea-board" replace />;
  }

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading request data...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Vibe Request/Challenge' : 'Create New Vibe Request/Challenge'}</h1>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What's your idea or challenge?"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your idea or challenge in detail..."
            required
            rows={6}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., web, mobile, AI, productivity"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Type</Label>
          {/* Fallback for SegmentedControl if not available */}
          <div className="mt-1 flex space-x-4">
             <label className="flex items-center space-x-2">
               <input
                 type="radio"
                 name="type"
                 value="request"
                 checked={formData.type === 'request'}
                 onChange={() => handleTypeChange('request')}
                 className="form-radio"
               />
               <span>Idea / Request</span>
             </label>
             <label className="flex items-center space-x-2">
               <input
                 type="radio"
                 name="type"
                 value="challenge"
                 checked={formData.type === 'challenge'}
                 onChange={() => handleTypeChange('challenge')}
                 className="form-radio"
               />
               <span>Challenge</span>
             </label>
          </div>
          {/*
          <SegmentedControl
            name="type"
            value={formData.type}
            onValueChange={handleTypeChange}
            options={[
              { label: 'Idea/Request', value: 'request' },
              { label: 'Challenge', value: 'challenge' },
            ]}
            className="mt-1"
          />
          */}
        </div>
        <Button type="submit" disabled={submitting || loading} className="w-full">
          {submitting ? (isEditMode ? 'Saving...' : 'Submitting...') : (isEditMode ? 'Save Changes' : 'Submit Idea/Challenge')}
        </Button>
      </form>
    </div>
  );
};

export default VibeRequestFormPage;
