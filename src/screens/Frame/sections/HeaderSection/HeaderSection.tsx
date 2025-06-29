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
 * @description Props for the HeaderSection component
 * @param {() => void} onPulseButtonClick - Function to call when the pulse button is clicked
 * @param {boolean} hasNewActivity - Indicates if there's new activity to signal
 */
interface HeaderSectionProps {
  onPulseButtonClick: () => void;
  hasNewActivity: boolean;
}

/**
 * @description Header component with navigation and authentication UI
 * @param {HeaderSectionProps} props - Component props
 * @returns {JSX.Element} Application header with responsive navigation and auth controls
 */
export const HeaderSection = ({ onPulseButtonClick, hasNewActivity }: HeaderSectionProps): JSX.Element => {
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
        <div className="font-heading text-startsnap-ebony-clay text-3xl leading-9">
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
                    className="font-ui text-startsnap-oxford-blue text-lg md:text-xl tracking-[var(--startsnap-semantic-link-letter-spacing)] leading-[var(--startsnap-semantic-link-line-height)] hover:text-startsnap-french-rose transition-colors"
                  >
                    <Link to={link.href}>{link.title}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {user && (
            <Button
              variant="primary"
              asChild
              className="flex items-center gap-2"
            >
              <Link to="/create">
                <span>Add StartSnap</span>
              </Link>
            </Button>
          )}

          {/* Community Pulse Button */}
          <Button
            variant="success"
            onClick={onPulseButtonClick}
            className={`flex items-center gap-2 ${hasNewActivity ? 'animate-pulse-glow' : ''}`}
            aria-label="Open Community Pulse"
          >
            <span className="material-icons text-lg">bolt</span>
            <span className="hidden lg:inline">Pulse</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="w-10 h-10 cursor-pointer hover:scale-105 transition-all duration-200 rounded-full overflow-hidden border-2 border-transparent hover:border-startsnap-french-rose/30">
                  <UserAvatar
                    name={getAvatarName(user, userProfile?.username)}
                    size={40}
                    className="w-full h-full"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-4 bg-white border-2 border-gray-800 rounded-xl shadow-[3px_3px_0px_#1f2937]">
                {/* User Info Header */}
                                  <div className="flex items-center gap-4 p-4 mb-4 bg-gray-50 rounded-xl border-b border-gray-200">
                    <div className="w-12 h-12">
                      <UserAvatar
                        name={getAvatarName(user, userProfile?.username)}
                        size={48}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-ui text-startsnap-oxford-blue text-lg">
                        {userProfile?.username || user.email?.split('@')[0] || 'User'}
                      </p>
                    </div>
                  </div>

                {/* Account Actions */}
                <div>
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="p-0">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group w-full"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-startsnap-oxford-blue/10 transition-colors">
                          <User size={16} className="text-startsnap-oxford-blue" />
                        </div>
                        <span className="font-ui text-startsnap-oxford-blue text-sm">
                          My Profile
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="p-0">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-all duration-200 group w-full"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <LogOut size={16} className="text-red-500" />
                        </div>
                        <span className="font-ui text-red-500 text-sm">
                          Sign Out
                        </span>
                      </button>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => handleAuthClick('signup')}
                className=""
              >
                Get Started
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
            className="min-w-[48px] min-h-[48px] p-2 text-startsnap-oxford-blue hover:text-startsnap-french-rose hover:bg-startsnap-mischka/20 rounded-xl transition-all duration-200 active:scale-95"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={28} strokeWidth={2.5} /> : <Menu size={28} strokeWidth={2.5} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu - LEGENDARY DESIGN */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t-2 border-startsnap-french-rose animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
          <div className="p-6 max-h-[calc(100vh-120px)] overflow-y-auto">

            {/* Navigation Section */}
            <div className="mb-8">
              <h3 className="font-ui text-startsnap-oxford-blue text-sm uppercase tracking-wider mb-4 px-2">
                Explore
              </h3>
              <nav className="space-y-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-startsnap-mischka/30 transition-all duration-200 active:scale-[0.98] group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-startsnap-oxford-blue/10 flex items-center justify-center group-hover:bg-startsnap-french-rose/20 transition-colors">
                      <span className="material-icons text-startsnap-oxford-blue group-hover:text-startsnap-french-rose transition-colors">
                        {link.title === 'Profiles' ? 'people' : 'dashboard'}
                      </span>
                    </div>
                    <span className="font-ui text-startsnap-oxford-blue text-lg group-hover:text-startsnap-french-rose transition-colors">
                      {link.title}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-8">
              <h3 className="font-ui text-startsnap-oxford-blue text-sm uppercase tracking-wider mb-4 px-2">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {/* Community Pulse - Premium Action */}
                <Button
                  variant="success"
                  onClick={() => {
                    onPulseButtonClick();
                    toggleMobileMenu();
                  }}
                  className={`w-full h-12 flex items-center justify-center gap-3 ${hasNewActivity ? 'animate-pulse-glow' : ''}`}
                >
                  <span className="material-icons text-xl">bolt</span>
                  <span>Community Pulse</span>
                  {hasNewActivity && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </Button>

                {/* Add StartSnap - Primary Action */}
                {user && (
                  <Button
                    variant="primary"
                    asChild
                    onClick={toggleMobileMenu}
                    className="w-full h-12 flex items-center justify-center gap-3"
                  >
                    <Link to="/create" className="flex items-center gap-3">
                      <span className="material-icons text-xl">add_circle</span>
                      <span>Add StartSnap</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Account Section */}
            <div className="border-t border-gray-200 pt-6">
              {user ? (
                <>
                  <div className="flex items-center gap-4 p-4 mb-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12">
                      <UserAvatar
                        name={getAvatarName(user, userProfile?.username)}
                        size={48}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-ui text-startsnap-oxford-blue text-lg">
                        {userProfile?.username || user.email?.split('@')[0] || 'User'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={toggleMobileMenu}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-startsnap-oxford-blue/10 transition-colors">
                        <User size={20} className="text-startsnap-oxford-blue" />
                      </div>
                      <span className="font-ui text-startsnap-oxford-blue text-lg">
                        My Profile
                      </span>
                    </Link>

                    <Button
                      variant="unstyled"
                      onClick={() => {
                        handleSignOut();
                        toggleMobileMenu();
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 transition-all duration-200 active:scale-[0.98] group justify-start h-auto"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut size={20} className="text-red-500" />
                      </div>
                      <span className="font-ui text-red-500 text-lg">
                        Sign Out
                      </span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleAuthClick('signup');
                      toggleMobileMenu();
                    }}
                    className="w-full h-12"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
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