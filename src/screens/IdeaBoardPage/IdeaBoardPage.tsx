import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { VibeRequestCard } from '../../components/ui/VibeRequestCard'; // Actual import
import { useAuth } from '../../context/AuthContext';
import { VibeRequest } from '../../types/vibeRequest'; // Import from types


const IdeaBoardPage: React.FC = () => {
  const [vibeRequests, setVibeRequests] = useState<VibeRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth(); // Example of using AuthContext

  useEffect(() => {
    const fetchVibeRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('vibe_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }
        setVibeRequests(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch vibe requests.');
        console.error('Error fetching vibe requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVibeRequests();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Vibe Requests & Challenges</h1>
        {auth?.user && ( // Only show if user is logged in - adjust as per your AuthContext
          <Link to="/idea-board/new">
            <Button>Submit New Idea/Challenge</Button>
          </Link>
        )}
      </header>

      {/* Placeholder for filter/sort controls */}
      <div style={{ marginBottom: '20px' }}>
        {/* Example: <FilterControls onFilterChange={...} /> */}
        <p><i>Filter and sort controls will be here.</i></p>
      </div>

      {loading && <p>Loading ideas...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && vibeRequests.length === 0 && (
        <p>No ideas posted yet. Be the first!</p>
      )}

      {!loading && !error && vibeRequests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vibeRequests.map((request) => (
            <VibeRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeaBoardPage;
