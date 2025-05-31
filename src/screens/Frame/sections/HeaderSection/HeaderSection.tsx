/**
 * src/screens/Frame/sections/HeaderSection/HeaderSection.tsx
 * @description Application header with navigation and authentication controls
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";
import { AuthDialog } from "../../../../components/ui/auth-dialog";
import { supabase } from "../../../../lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { UserAvatar, getAvatarName } from "../../../../components/ui/user-avatar";

/**
 * @description Header component with navigation and authentication UI
 * @returns {JSX.Element} Application header with responsive navigation and auth controls
 */
export const HeaderSection = (): JSX.Element => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username?: string } | null>(null);
  const { user } = useAuth();

  // Fetch user profile when user changes to get consistent username
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user profile for header:', error);
            return;
          }

          setUserProfile(data);
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  // Only "Feed" is visible to all users
  const navLinks = [
    { title: "Feed", href: "#" },
  ];

  // "Create StartSnap" is only visible to authenticated users
  const authenticatedNavLinks = [
    { title: "Create StartSnap", href: "/create" },
  ];

  /**
   * @description Opens the authentication dialog with the specified mode
   * @param {('signup'|'login')} mode - The authentication mode to open
   */
  const handleAuthClick = (mode: 'signup' | 'login') => {
    setAuthMode(mode);
    setIsAuthDialogOpen(true);
  };

  /**
   * @description Handles switching between login and signup modes
   * @param {('signup'|'login')} newMode - The new authentication mode
   */
  const handleAuthModeChange = (newMode: 'signup' | 'login') => {
    setAuthMode(newMode);

  /**
   * @description Handles user sign out process
   * @async
   * @sideEffects Signs out the current user via Supabase auth
   */
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center p-6 bg-[--startsnap-beige] shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a]">
      <div className="flex items-center justify-between w-full max-w-screen-2xl">
        <div className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-3xl leading-9">
          <Link to="/" className="hover:text-startsnap-french-rose transition-colors">
            startsnap.fun
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              {/* Always show public links */}
              {navLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    href={link.href}
                    className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue text-[length:var(--startsnap-semantic-link-font-size)] tracking-[var(--startsnap-semantic-link-letter-spacing)] leading-[var(--startsnap-semantic-link-line-height)] hover:text-startsnap-french-rose transition-colors"
                  >
                    {link.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {/* Only show authenticated links if user is logged in */}
              {user && authenticatedNavLinks.map((link, index) => (
                <NavigationMenuItem key={`auth-${index}`}>
                  <NavigationMenuLink
                    href={link.href}
                    className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue text-[length:var(--startsnap-semantic-link-font-size)] tracking-[var(--startsnap-semantic-link-letter-spacing)] leading-[var(--startsnap-semantic-link-line-height)] hover:text-startsnap-french-rose transition-colors"
                  >
                    {link.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
                  <UserAvatar
                    name={getAvatarName(user, userProfile?.username)}
                    size={40}
                    className="w-full h-full"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer hover:bg-startsnap-mischka/50 flex items-center gap-2" asChild>
                  <Link to="/profile" className="flex items-center gap-2 w-full">
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-startsnap-french-rose hover:text-startsnap-french-rose hover:bg-startsnap-mischka/50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleAuthClick('login')}
                className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Login
              </Button>

              <Button
                onClick={() => handleAuthClick('signup')}
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        mode={authMode}
        onModeChange={handleAuthModeChange}
      />
    </header>
  );
};