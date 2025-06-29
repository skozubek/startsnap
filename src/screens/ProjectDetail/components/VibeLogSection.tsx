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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { VibeLog, VibeLogFormData } from "../../../types/vibeLog";
import { toast } from "sonner";
import { ConfirmationDialog } from "../../../components/ui/confirmation-dialog";

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

  // Confirmation dialog state
  const [deletingVibeLogId, setDeletingVibeLogId] = useState<string | null>(null);
  const [isDeletingVibeLog, setIsDeletingVibeLog] = useState(false);

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
      toast.error('Missing Information', {
        description: 'Please provide a title and content for the Vibe Log entry.'
      });
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
      toast.success('Vibe Log Added!', {
        description: 'Your new entry has been added to the project.'
      });
      await onVibeLogChange();
      setIsAddingVibeLog(false);
      setNewVibeLogData({ log_type: 'update', title: '', content: '' });
    } catch (error) {
      console.error('Error adding vibe log entry:', error);
      toast.error('Add Failed', {
        description: 'Failed to add vibe log entry. Please try again.'
      });
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
      toast.error('Missing Information', {
        description: 'Please provide a title and content for the Vibe Log entry.'
      });
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
      toast.success('Vibe Log Updated!', {
        description: 'Your changes have been saved successfully.'
      });
      await onVibeLogChange();
      setEditingVibeLogInline(null);
      setCurrentEditVibeLogData(null);
    } catch (error) {
      console.error('Error updating vibe log entry:', error);
      toast.error('Update Failed', {
        description: 'Failed to update vibe log entry. Please try again.'
      });
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
   * @description Shows confirmation dialog for vibe log deletion
   * @param {string} entryId - The ID of the Vibe Log entry to delete
   */
  const handleDeleteVibeLog = (entryId: string) => {
    setDeletingVibeLogId(entryId);
  };

  /**
   * @description Confirms and executes vibe log deletion
   * @async
   * @sideEffects Makes a Supabase delete call and then calls onVibeLogChange
   */
  const confirmDeleteVibeLog = async () => {
    if (!deletingVibeLogId) return;

    setIsDeletingVibeLog(true);
    try {
      const { error } = await supabase
        .from('vibelogs')
        .delete()
        .eq('id', deletingVibeLogId);
      if (error) throw error;

      toast.success('Vibe Log Deleted', {
        description: 'The entry has been permanently removed.'
      });
      await onVibeLogChange();
      setDeletingVibeLogId(null);
    } catch (error) {
      console.error('Error deleting vibe log entry:', error);
      toast.error('Delete Failed', {
        description: 'Failed to delete vibe log entry. Please try again.'
      });
    } finally {
      setIsDeletingVibeLog(false);
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
    <div className="p-4 md:border-b-2 md:border-gray-800 md:p-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center">
          <h2 className="font-heading text-startsnap-ebony-clay text-2xl leading-8">
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
            variant="primary"
            size="sm"
          >
            <span className="material-icons text-base mr-2">post_add</span>
            Add Entry
          </Button>
        )}
      </div>

      {isOwner && isAddingVibeLog && (
        <div className="startsnap-form-card">
          <div className="py-2 md:p-0">
            <h3 className="font-subheading text-gray-900 text-xl mb-6 px-1 md:px-0 md:mb-4">
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
            <div className="startsnap-form-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAddingVibeLog(false);
                  setNewVibeLogData({ log_type: 'update', title: '', content: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleVibeLogSubmit}
                disabled={!newVibeLogData.title.trim() || !newVibeLogData.content.trim()}
              >
                Submit Entry
              </Button>
            </div>
          </div>
        </div>
      )}

      {vibeLogEntries.length > 0 ? (
        vibeLogEntries.map((entry: VibeLog) => {
          const logType = entry.log_type || 'update';
          const iconData = getVibeLogDisplay(logType);
          if (isOwner && editingVibeLogInline && editingVibeLogInline.id === entry.id && currentEditVibeLogData) {
            return (
              <div key={`${entry.id}-edit`} className="startsnap-form-card">
                <div className="py-2 md:p-0">
                  <h3 className="font-subheading text-gray-900 text-xl mb-6 px-1 md:px-0 md:mb-4">
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
                  <div className="startsnap-form-actions">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingVibeLogInline(null);
                        setCurrentEditVibeLogData(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUpdateVibeLog}
                      disabled={!currentEditVibeLogData.title.trim() || !currentEditVibeLogData.content.trim()}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={entry.id} className="mb-8 last:mb-0">
              <div className="flex items-start">
                <div
                  className={`p-2.5 ${iconData.iconBg} rounded-full border-2 border-solid ${iconData.iconBorder} ${iconData.iconColor} text-3xl flex items-center justify-center flex-shrink-0`}
                >
                  <span className="material-icons text-3xl">{iconData.icon}</span>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-body text-startsnap-pale-sky text-xs leading-4">
                      {formatDetailedDate(entry.created_at)}
                    </p>
                    {isOwner && (
                      <div className="flex-shrink-0 ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleShareOnX(entry.title)}
                              className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                            >
                              <span className="mr-2 flex items-center justify-center">
                                {React.createElement(FaXTwitter as any, { className: "text-sm" })}
                              </span>
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditVibeLogInline(entry)}
                              className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteVibeLog(entry.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  <h3 className="font-heading text-startsnap-ebony-clay text-xl leading-7 mb-3">
                    {entry.title}
                  </h3>
                  <div className="prose prose-sm md:prose-base max-w-none text-startsnap-river-bed font-body leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre: ({ children }) => (
                          <pre className="bg-gray-900 text-white border-2 border-gray-800 rounded-lg p-4 overflow-x-auto text-sm font-mono my-4">
                            {children}
                          </pre>
                        ),
                        code: ({ inline, children }) => (
                          inline ? (
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className="block">{children}</code>
                          )
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-startsnap-oxford-blue mt-6 mb-3 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold text-startsnap-oxford-blue mt-5 mb-2 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold text-startsnap-oxford-blue mt-4 mb-2 first:mt-0">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 my-3">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1 my-3">
                            {children}
                          </ol>
                        ),
                        p: ({ children }) => (
                          <p className="my-2 first:mt-0 last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-startsnap-oxford-blue">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {entry.content || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="font-body text-startsnap-pale-sky text-base leading-6">
          No vibe log entries yet. Check back soon for updates!
        </p>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingVibeLogId !== null}
        onClose={() => setDeletingVibeLogId(null)}
        onConfirm={confirmDeleteVibeLog}
        title="Delete Vibe Log Entry"
        description="Are you sure you want to delete this vibe log entry? This action cannot be undone."
        confirmText="Delete Entry"
        isLoading={isDeletingVibeLog}
        type="danger"
      />
    </div>
  );
};