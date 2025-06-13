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
import { LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { UserAvatar, getAvatarName } from "../../../../components/ui/user-avatar";
import type { UserProfileData } from "../../../../types/user";

/**
 * @description Header component with navigation and authentication UI
 * @returns {JSX.Element} Application header with responsive navigation and auth controls
 */
export const HeaderSection = (): JSX.Element => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Pick<UserProfileData, 'username'> | null>(null);
  const { user, handleAuthErrorAndSignOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Only "Feed" & Profiles are visible to all users
  const navLinks = [
    { title: "Profiles", href: "/profiles" },
    { title: "Projects", href: "/projects" },
  ];

  /**
   * @description Toggles the mobile menu visibility.
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * @description Opens the authentication dialog with the specified mode
   * @param {('signup'|'login')} mode - The authentication mode to open
   */
  const handleAuthClick = (mode: 'signup' | 'login') => {
    setAuthMode(mode);
    setIsAuthDialogOpen(true);
  };

  /**
   * @description Handles user sign out process with robust error handling
   * @async
   * @sideEffects Signs out the current user using enhanced AuthContext logout
   */
  const handleSignOut = async () => {
    await handleAuthErrorAndSignOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center p-6 bg-[--startsnap-beige] shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a]">
      <div className="flex items-center justify-between w-full max-w-screen-2xl">
        <div className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-3xl leading-9">
          <Link to="/" className="hover:text-startsnap-french-rose transition-colors">
            startsnap.fun
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              {navLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    asChild
                    className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue text-lg md:text-xl font-medium tracking-[var(--startsnap-semantic-link-letter-spacing)] leading-[var(--startsnap-semantic-link-line-height)] hover:text-startsnap-french-rose transition-colors"
                  >
                    <Link to={link.href}>{link.title}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {user && (
            <Button
              asChild
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2"
            >
              <Link to="/create">
                <span>Add StartSnap</span>
              </Link>
            </Button>
          )}

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

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="text-startsnap-oxford-blue hover:text-startsnap-french-rose"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[--startsnap-beige] shadow-lg p-6 animate-in slide-in-from-top-2 duration-300">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                onClick={toggleMobileMenu}
                className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue text-lg font-medium hover:text-startsnap-french-rose transition-colors py-2 text-center"
              >
                {link.title}
              </Link>
            ))}
            <hr className="my-2 border-startsnap-mischka" />
            {user && (
              <Button
                asChild
                onClick={toggleMobileMenu}
                className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center justify-center gap-2"
              >
                <Link to="/create">
                  <span>Add StartSnap</span>
                </Link>
              </Button>
            )}
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={toggleMobileMenu}
                  className="font-['Space_Grotesk',Helvetica] text-startsnap-oxford-blue text-lg font-medium hover:text-startsnap-french-rose transition-colors py-2 text-center flex items-center justify-center gap-2"
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSignOut();
                    toggleMobileMenu();
                  }}
                  className="w-full font-['Space_Grotesk',Helvetica] text-startsnap-french-rose text-lg font-medium hover:text-startsnap-french-rose hover:bg-startsnap-mischka/10 transition-colors py-2 flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleAuthClick('login');
                    toggleMobileMenu();
                  }}
                  className="w-full startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    handleAuthClick('signup');
                    toggleMobileMenu();
                  }}
                  className="w-full startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      )}

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        mode={authMode}
      />
    </header>
  );
};