/**
 * src/screens/ProjectDetail/components/VibeLogSection.tsx
 * @description Component for displaying and managing Vibe Log entries for a StartSnap project.
 */
import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from "../../../lib/supabase";
import { getVibeLogDisplay } from "../../../config/categories";
import { formatDetailedDate } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { VibeLogEntry as VibeLogEntryComponent } from '../../../components/ui/vibe-log-entry';
import { FaXTwitter } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { VibeLog, VibeLogFormData } from "../../../types/vibeLog";

/**
 * @description Props for the VibeLogSection component.
 * @param startsnapId - The ID of the current StartSnap project.
 * @param initialVibeLogEntries - The initial list of Vibe Log entries.
 * @param isOwner - Boolean indicating if the current user owns the project.
 * @param currentUserId - The ID of the current authenticated user, if any.
 * @param onVibeLogChange - Callback function to be invoked when Vibe Log data changes, to trigger a refresh in the parent.
 */
interface VibeLogSectionProps {
  startsnapId: string;
  initialVibeLogEntries: VibeLog[];
  isOwner: boolean;
  projectName: string;
  isHackathonEntry: boolean;
  currentUserId?: string;
  onVibeLogChange: () => Promise<void>;
}

/**
 * @description Section component for managing and displaying Vibe Log entries.
 * @param {VibeLogSectionProps} props - The props for the component.
 * @returns {JSX.Element} The Vibe Log section.
 */
export const VibeLogSection: React.FC<VibeLogSectionProps> = ({
  startsnapId,
  initialVibeLogEntries,
  isOwner,
  projectName,
  isHackathonEntry,
  currentUserId,
  onVibeLogChange,
}) => {
  const [vibeLogEntries, setVibeLogEntries] = useState<VibeLog[]>(initialVibeLogEntries);
  const [isAddingVibeLog, setIsAddingVibeLog] = useState(false);
  const [editingVibeLogInline, setEditingVibeLogInline] = useState<VibeLog | null>(null);
  const [newVibeLogData, setNewVibeLogData] = useState<VibeLogFormData>({
    log_type: 'update',
    title: '',
    content: '',
  });
  const [currentEditVibeLogData, setCurrentEditVibeLogData] = useState<VibeLogFormData | null>(null);

  useEffect(() => {
    setVibeLogEntries(initialVibeLogEntries);
  }, [initialVibeLogEntries]);

  /**
   * @description Handles submission of a new Vibe Log entry.
   * @async
   * @sideEffects Makes a Supabase insert call and then calls onVibeLogChange.
   */
  const handleVibeLogSubmit = async () => {
    if (!startsnapId) return;
    if (!newVibeLogData.title.trim() || !newVibeLogData.content.trim()) {
      alert('Please provide a title and content for the Vibe Log entry.');
      return;
    }
    try {
      const { error } = await supabase
        .from('vibelogs')
        .insert({
          startsnap_id: startsnapId,
          log_type: newVibeLogData.log_type,
          title: newVibeLogData.title,
          content: newVibeLogData.content
        });
      if (error) throw error;
      await onVibeLogChange();
      setIsAddingVibeLog(false);
      setNewVibeLogData({ log_type: 'update', title: '', content: '' });
    } catch (error) {
      console.error('Error adding vibe log entry:', error);
      alert('Failed to add vibe log entry. Please try again.');
    }
  };

  /**
   * @description Handles updating an existing Vibe Log entry.
   * @async
   * @sideEffects Makes a Supabase update call and then calls onVibeLogChange.
   */
  const handleUpdateVibeLog = async () => {
    if (!editingVibeLogInline || !currentEditVibeLogData) return;
    if (!currentEditVibeLogData.title.trim() || !currentEditVibeLogData.content.trim()) {
      alert('Please provide a title and content for the Vibe Log entry.');
      return;
    }
    try {
      const { error } = await supabase
        .from('vibelogs')
        .update({
          log_type: currentEditVibeLogData.log_type,
          title: currentEditVibeLogData.title,
          content: currentEditVibeLogData.content,
          updated_at: new Date()
        })
        .eq('id', editingVibeLogInline.id);
      if (error) throw error;
      await onVibeLogChange();
      setEditingVibeLogInline(null);
      setCurrentEditVibeLogData(null);
    } catch (error) {
      console.error('Error updating vibe log entry:', error);
      alert('Failed to update vibe log entry. Please try again.');
    }
  };

  /**
   * @description Sets up the state for editing a Vibe Log entry inline.
   * @param {VibeLog} entry - The Vibe Log entry to edit.
   */
  const handleEditVibeLogInline = (entry: VibeLog) => {
    setEditingVibeLogInline(entry);
    setCurrentEditVibeLogData({
      log_type: entry.log_type,
      title: entry.title,
      content: entry.content,
    });
    setIsAddingVibeLog(false); // Close add form if open
  };

  /**
   * @description Handles deletion of a Vibe Log entry.
   * @async
   * @param {string} entryId - The ID of the Vibe Log entry to delete.
   * @sideEffects Makes a Supabase delete call and then calls onVibeLogChange.
   */
  const handleDeleteVibeLog = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this vibe log entry? This action cannot be undone.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('vibelogs')
        .delete()
        .eq('id', entryId);
      if (error) throw error;
      await onVibeLogChange();
    } catch (error) {
      console.error('Error deleting vibe log entry:', error);
      alert('Failed to delete vibe log entry. Please try again.');
    }
  };

  /**
   * @description Constructs and opens a Twitter share URL for a vibe log entry
   * @param {string} title - The title of the vibe log entry
   * @sideEffects Opens a new browser window/tab with Twitter share intent
   */
  const handleShareOnX = (title: string) => {
    const baseUrl = window.location.origin;
    const projectUrl = `${baseUrl}${window.location.pathname}`;
    
    let shareText = `${title}\n\n`;
    shareText += `Checkout ${projectName} on\n\n ${projectUrl}`;
    if (isHackathonEntry) {
      shareText += "\n\n#buildinpublic #bolthackathon";
    } else {
      shareText += "\n\n#buildinpublic";
    }
    
    
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="border-b-2 border-gray-800 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
            Vibe Log
          </h2>
          <span className="ml-1 text-startsnap-corn text-2xl material-icons">
            insights
          </span>
        </div>
        {isOwner && (
          <Button
            onClick={() => {
              setIsAddingVibeLog(true);
              setEditingVibeLogInline(null); // Close edit form if open
              setNewVibeLogData({ log_type: 'update', title: '', content: '' });
            }}
            className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2 py-2 px-4 text-sm"
            size="sm"
          >
            <span className="material-icons text-lg">post_add</span>
            Add Entry
          </Button>
        )}
      </div>

      {isOwner && isAddingVibeLog && (
        <Card className="mb-8 p-4 border-2 border-gray-800 rounded-lg shadow-[3px_3px_0px_#1f2937] bg-startsnap-white">
          <CardContent className="p-0">
            <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl mb-3">
              Add New Vibe Log Entry
            </h3>
            <VibeLogEntryComponent
              type={newVibeLogData.log_type}
              title={newVibeLogData.title}
              content={newVibeLogData.content}
              onTypeChange={(log_type: string) => setNewVibeLogData(prev => ({ ...prev, log_type }))}
              onTitleChange={(title: string) => setNewVibeLogData(prev => ({ ...prev, title }))}
              onContentChange={(content: string) => setNewVibeLogData(prev => ({ ...prev, content }))}
              showAllTypes={true}
            />
            <div className="mt-4 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingVibeLog(false);
                  setNewVibeLogData({ log_type: 'update', title: '', content: '' });
                }}
                className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] py-2 px-5 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVibeLogSubmit}
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] py-2 px-5 text-base"
                disabled={!newVibeLogData.title.trim() || !newVibeLogData.content.trim()}
              >
                Submit Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {vibeLogEntries.length > 0 ? (
        vibeLogEntries.map((entry: VibeLog) => {
          const logType = entry.log_type || 'update';
          const iconData = getVibeLogDisplay(logType);
          if (isOwner && editingVibeLogInline && editingVibeLogInline.id === entry.id && currentEditVibeLogData) {
            return (
              <Card key={`${entry.id}-edit`} className="mb-8 p-4 border-2 border-gray-800 rounded-lg shadow-[3px_3px_0px_#1f2937] bg-startsnap-white">
                <CardContent className="p-0">
                  <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl mb-3">
                    Edit Vibe Log: <span className="font-normal">{entry.title}</span>
                  </h3>
                  <VibeLogEntryComponent
                    type={currentEditVibeLogData.log_type}
                    title={currentEditVibeLogData.title}
                    content={currentEditVibeLogData.content}
                    onTypeChange={(log_type: string) => setCurrentEditVibeLogData(prev => prev ? ({ ...prev, log_type }) : null)}
                    onTitleChange={(title: string) => setCurrentEditVibeLogData(prev => prev ? ({ ...prev, title }) : null)}
                    onContentChange={(content: string) => setCurrentEditVibeLogData(prev => prev ? ({ ...prev, content }) : null)}
                    showAllTypes={true}
                  />
                  <div className="mt-4 flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingVibeLogInline(null);
                        setCurrentEditVibeLogData(null);
                      }}
                      className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] py-2 px-5 text-base"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateVibeLog}
                      className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] py-2 px-5 text-base"
                      disabled={!currentEditVibeLogData.title.trim() || !currentEditVibeLogData.content.trim()}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }
          return (
            <div key={entry.id} className="mb-8 last:mb-0">
              <div className="flex items-start">
                <div
                  className={`p-2.5 ${iconData.iconBg} rounded-full border-2 border-solid ${iconData.iconBorder} ${iconData.iconColor} text-3xl flex items-center justify-center`}
                >
                  <span className="material-icons text-3xl">{iconData.icon}</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                      {formatDetailedDate(entry.created_at)}
                    </p>
                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4 text-startsnap-oxford-blue" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[160px]">
                          <DropdownMenuItem
                            onClick={() => handleEditVibeLogInline(entry)}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <span className="material-icons text-sm">edit</span>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShareOnX(entry.title)}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <FaXTwitter className="text-base" />
                          Share on X
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteVibeLog(entry.id)}
                            className="cursor-pointer text-red-600 flex items-center gap-2"
                          >
                            <span className="material-icons text-sm">delete</span>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mt-1">
                    {entry.title}
                  </h3>
                  <div className="prose prose-sm md:prose-base max-w-none text-startsnap-river-bed font-['Roboto',Helvetica] leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {entry.content || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="font-['Roboto',Helvetica] font-normal text-startsnap-pale-sky text-base leading-6">
          No vibe log entries yet. Check back soon for updates!
        </p>
      )}
    </div>
  );
};