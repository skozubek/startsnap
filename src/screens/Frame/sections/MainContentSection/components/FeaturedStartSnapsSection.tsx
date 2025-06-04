/**
 * src/screens/Frame/sections/MainContentSection/components/FeaturedStartSnapsSection.tsx
 * @description Component to display a list of featured StartSnap projects.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../../components/ui/button';
import { StartSnapCard } from '../../../../../components/ui/StartSnapCard';
import type { StartSnapProject } from '../../../../../types/startsnap';
import type { UserProfileData } from '../../../../../types/user';

interface FeaturedStartSnapsSectionProps {
  startSnaps: StartSnapProject[];
  loading: boolean;
  creators: Record<UserProfileData['user_id'], UserProfileData['username']>;
  formatDate: (dateString: string) => string;
  getCategoryDisplay: (categoryKey: string) => {
    name: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  };
}

/**
 * @description Renders the featured StartSnaps section, displaying project cards or loading/empty states.
 * @param {FeaturedStartSnapsSectionProps} props - The props for the component.
 * @param {StartSnapProject[]} props.startSnaps - Array of StartSnap projects to display.
 * @param {boolean} props.loading - Loading state indicator.
 * @param {Record<UserProfileData['user_id'], UserProfileData['username']>} props.creators - A map of user IDs to usernames.
 * @param {(dateString: string) => string} props.formatDate - Function to format date strings.
 * @param {(categoryKey: string) => { name: string; bgColor: string; textColor: string; borderColor: string; }} props.getCategoryDisplay - Function to get display properties for a category key.
 * @returns {JSX.Element} The FeaturedStartSnapsSection component.
 */
export const FeaturedStartSnapsSection = ({
  startSnaps,
  loading,
  creators,
  formatDate,
  getCategoryDisplay,
}: FeaturedStartSnapsSectionProps): JSX.Element => {
  return (
    <div className="w-full max-w-screen-2xl px-8 py-16">
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-12 font-['Space_Grotesk',Helvetica]">
        Featured StartSnaps
      </h2>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-xl text-startsnap-pale-sky">Loading projects...</p>
        </div>
      ) : startSnaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {startSnaps.slice(0, 3).map((startsnap) => {
            const creatorName = creators[startsnap.user_id] || 'Anonymous';

            return (
              <StartSnapCard
                key={startsnap.id}
                startsnap={startsnap}
                showCreator={true}
                creatorName={creatorName}
                variant="main-page"
                formatDate={formatDate}
                getCategoryDisplay={getCategoryDisplay}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-startsnap-pale-sky">No projects match your criteria. Try adjusting your search or filters!</p>
          <Button className="startsnap-button mt-4 bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]" asChild>
            <Link to="/create">Create StartSnap</Link>
          </Button>
        </div>
      )}
    </div>
  );
};