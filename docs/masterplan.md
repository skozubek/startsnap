**Master Plan: startsnap.fun - MVP & Next Features**

**Document Version:** 1.0
**Date:** June 3, 2025 (using your example dates)

**I. High-Level Overview & Vision:**

*   **Platform Name:** startsnap.fun
*   **Core Vision:** A mobile-first community platform for "Vibe Coders" to showcase their AI-assisted projects ("StartSnaps"), document their building journey ("Vibe Log"), give and receive feedback (including threaded replies), connect with peers, and discover opportunities (collaboration, work).
*   **Target Audience:** Developers, designers, creators, particularly those leveraging AI in their projects ("Vibe Coders").
*   **Design Aesthetic:** Modern Neobrutalism (bold, clear, content-focused, consistent component styling).
*   **Key Differentiators:**
    *   Emphasis on the "Vibe Log" as a narrative of the creation process.
    *   Strong community feedback and discussion features.
    *   Platform for discovering talent and projects.

**II. Core Functionality & Components**


1.  **User Authentication & Profiles (`AuthContext.tsx`, `Profile.tsx`, `HeaderSection.tsx`, `AuthDialog.tsx`, `UserAvatar.tsx`):**
    *   Email/Password Signup & Login via Supabase.
    *   Global authentication state management using React Context (`AuthContext`).
    *   Protected routes for authenticated actions.
    *   User Profile Page:
        *   Display: Username (from `profiles` table or email), `UserAvatar` (boring-avatars).
        *   Editable Bio.
        *   Editable User Status (e.g., "Actively Building", "Seeking Feedback", "Looking for Work") using `USER_STATUS_CONFIG` and `Popover`.
        *   Editable External Links (GitHub, Twitter, LinkedIn, Website) with validation.
        *   Portfolio display of user's own StartSnaps using `StartSnapCard`.
    *   `UserAvatar.tsx`: Centralized component for consistent `boring-avatars` display.

2.  **StartSnaps (Projects - `startsnaps` table, `ProjectForm.tsx`, `StartSnapCard.tsx`, `CreateStartSnap.tsx`, `EditStartSnap.tsx`):**
    *   **Creation/Editing:**
        *   Form (`ProjectForm.tsx`) for creating and editing StartSnaps.
        *   Fields: Project Type ("idea" or "live" via `SegmentedControl`), Project Name, Description, Category (from `CATEGORY_CONFIG`), Live Demo URL, Video Demo URL, General Tags, Tools Used, Hackathon Entry flag.
        *   Initial Vibe Log entry created upon StartSnap creation.
        *   Input validation for key fields.
    *   **Display (`StartSnapCard.tsx`):**
        *   Content-first card design with a category-colored header.
        *   Displays: Project Name, Category Badge, Project Type Badge, Hackathon Entry Badge, Description (line-clamped), General Tags, Tools Used.
        *   Conditional display of creator info (avatar, name, launch date).
        *   Clickable card links to `ProjectDetail` page.
        *   Different variants for "main-page" and "profile" display.
    *   **Data Storage:** `startsnaps` table in Supabase.

3.  **Project Detail Page (`ProjectDetail.tsx` & sub-components):**
    *   **Unified Header:** Category-colored header displaying Project Name, Category Badge, Type Badge, Hackathon Badge (consistent with `StartSnapCard`).
    *   **Project Info Section (`ProjectInfoSection.tsx`):**
        *   Displays: Project Links, Full Description, Tags, Tools Used, Creator Info.
        *   Action Buttons: "Edit Project" (for owner).
    *   **Vibe Log Section (`VibeLogSection.tsx`):**
        *   Displays list of Vibe Log entries for the project.
        *   Each entry shows: Icon (from `VIBE_LOG_CONFIG`), Title, Content, Timestamp.
        *   **Inline Adding:** Project owner can add new Vibe Log entries via an inline form (using `VibeLogEntry.tsx` with `showAllTypes=true`).
        *   **Inline Editing/Deleting:** Project owner can edit/delete their Vibe Log entries inline (edit uses `VibeLogEntry.tsx`).
        *   **Load More Functionality:** Implemented to manage long lists of Vibe Logs (initially shows `VIBE_LOG_PAGE_SIZE`, with "Load More" / "Show Less" buttons).
    *   **Community Feedback Section (`FeedbackSection.tsx`):**
        *   Displays list of feedback entries for the project.
        *   Each feedback shows: Commenter's Avatar, Username (from joined `profiles` table), Content, Timestamp.
        *   **Inline Reply Functionality (Two-Level Threading):**
            *   "Reply" action (icon + reply count) on each parent feedback toggles an inline reply form.
            *   Inline form for new replies includes current user's avatar, textarea, submit/cancel.
            *   Submitted replies are displayed indented under the parent feedback.
            *   Replies themselves are visually lighter (no heavy card borders).
            *   Reply authors can edit/delete their own replies (edit uses an inline form, delete has confirmation).
        *   **Main Feedback Form:** Inline form at the bottom of the feedback list for adding new top-level feedback, showing current user's avatar if logged in, disabled otherwise.
    *   **Data Storage:** `vibelogs` table, `feedbacks` table, `feedback_replies` table in Supabase.

4.  **Main Feed/Gallery (`MainContentSection.tsx`):**
    *   Hero section with Typed.js animation for "Startsnaps".
    *   Displays a list of recent StartSnaps using `StartSnapCard` (currently limited to 6).
    *   Fetches and displays creator usernames for each card.

5.  **Configuration (`config/categories.ts`):**
    *   Centralized configuration for `CATEGORY_CONFIG`, `VIBE_LOG_CONFIG`, `USER_STATUS_CONFIG`.
    *   Provides display properties (colors, icons, labels, placeholders) and `get...` utility functions.

6.  **UI Components (`src/components/ui/`):**
    *   Collection of reusable Shadcn/ui-based components, plus custom ones like `UserAvatar`, `SegmentedControl`, `VibeLogEntry`, `FeedbackModal` (though `FeedbackModal` is now only for editing feedback, and `AddVibeLogModal` has been removed).

**III. Planned Features (Next Steps for MVP & Beyond):**

1.  **Project Support & Basic Ranking:**
    *   **Goal:** Allow users to "Support" a StartSnap. Display support counts and use this for a basic ranking/sorting option.
    *   **Database Changes:**
        *   Add `support_count` (INTEGER, DEFAULT 0, NOT NULL) column to the `public.startsnaps` table.
        *   Create a new table: `public.project_supporters`
            *   `startsnap_id` (UUID, PK, FK to `public.startsnaps(id)` ON DELETE CASCADE)
            *   `user_id` (UUID, PK, FK to `auth.users(id)` ON DELETE CASCADE)
            *   `created_at` (TIMESTAMPTZ, DEFAULT `now()`)
        *   (Create a new Supabase migration for these changes).
    *   **RLS for `project_supporters`:**
        *   SELECT: Allow public viewing (to check if a user supported a project).
        *   INSERT: Authenticated users can insert (one record per user per startsnap).
        *   DELETE: User can delete their own support record.
    *   **Frontend (`ProjectDetail.tsx` - `ProjectInfoSection.tsx`):**
        *   The "Support Project" button (currently in `ProjectInfoSection.tsx` but non-functional):
            *   **State:** Button should change appearance/text if `currentUser` has already supported this `startsnap` (e.g., "Supported ✔" with different styling).
            *   **Action:**
                *   If not supported: Clicking inserts a record into `project_supporters` and increments `support_count` on the `startsnaps` table (ideally via a Supabase Edge Function or trigger to keep count accurate, or client-side update with re-fetch).
                *   If supported: Clicking deletes the record from `project_supporters` and decrements `support_count`.
        *   **Display:** Show the `startsnap.support_count` clearly near the project title or action buttons.
    *   **Frontend (`MainContentSection.tsx` & `Profile.tsx` - `StartSnapCard.tsx`):**
        *   Display the `support_count` on StartSnap cards.
        *   Add a sorting option to the main feed to "Sort by Most Supported".

2.  **User Availability & Discovery (Post-MVP or MVP Stretch):**
    *   **Goal:** Allow users to signal their availability (for work, collaboration) and enable others (e.g., "Head Hunters," other Vibe Coders) to find them based on this status and their portfolio.
    *   **Existing Foundation:** The `profiles` table already has a `status` column and `USER_STATUS_CONFIG` defines statuses like "Looking for Work" and "Open to Collaboration."
    *   **Phase 1: Filtering on a "Discover" or "Community" Page (New Screen):**
        *   Create a new screen (e.g., `/discover` or `/community`).
        *   This page would display a list/grid of user profiles (similar to StartSnap cards but for users).
        *   **Filters:** Add filters to this page to allow filtering users by their `status` from `USER_STATUS_CONFIG`.
        *   Each user card could show: Avatar, Username, current Status (with icon), a snippet of their Bio, and maybe a count of their StartSnaps. Clicking a user card navigates to their full `Profile.tsx` page.
    *   **Phase 2: "Head Hunter" Role / Premium Features (Post-MVP):**
        *   Introduce a new user role (e.g., "Recruiter" or "TalentSeeker"). This might require changes to `auth.users` metadata or a separate roles table.
        *   Recruiters could have enhanced search/filter capabilities on the "Discover" page.
        *   Direct messaging/contact features (more complex, definitely post-MVP).
        *   This could be a monetization avenue (e.g., recruiters pay for access or enhanced features).
    *   **Data to Display:** Ensure the `Profile.tsx` page effectively showcases a user's portfolio (`userStartSnaps`) and bio, making it a valuable destination for someone discovering them.

3.  **Gamification (Badges - MVP or Post-MVP):**
    *   **Goal:** Award badges to users for various achievements to encourage engagement.
    *   **Database:**
        *   `badges` table: `id`, `name`, `description`, `icon_url`.
        *   `user_badges` junction table: `user_id`, `badge_id`, `earned_at`.
        *   (Create Supabase migrations for these).
    *   **Badge Awarding Logic (Supabase Edge Functions or backend logic triggered by actions):**
        *   "First StartSnap!": On first insert into `startsnaps` by a user.
        *   "Vibe Logger": After ~3 `vibelogs` entries for a single Startsnap by owner.
        *   "Feedback Giver": After ~5 `feedbacks` or `feedback_replies` by a user.
        *   "Popular Vibe": When a `startsnap.support_count` reaches a threshold (e.g., 25).
        *   "Bolt.new Hackathon '25 Pioneer": If `startsnap.is_hackathon_entry` is true.
    *   **Display:** Show earned badges on the `Profile.tsx` page.

**IV. Technical Debt & Minor Refinements (Ongoing):**

*   **Type Safety:** Gradually replace `any` types with specific interfaces where appropriate (e.g., for `startsnap` data, `creator` data, `vibeLogEntries`, `feedbackEntries` in `ProjectDetail.tsx`).
*   **Error Handling:** Transition from `alert()` to more user-friendly inline messages or toast notifications for errors.
*   **Loading States:** Enhance loading state visuals beyond simple text where appropriate (e.g., skeleton loaders for cards).
*   **Component Styling Consistency:** Ensure button styles, form input styles, etc., are fully consistent across all inline forms and modals.
*   **Accessibility (A11y):** Review for ARIA attributes, keyboard navigability, color contrast, etc.