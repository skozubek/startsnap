import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";
import { AuthDialog } from "../../../../components/ui/auth-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { supabase } from "../../../../lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export const HeaderSection = (): JSX.Element => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { title: "Feed", href: "#" },
    { title: "Create Project", href: "#" },
    { title: "Profile", href: "#" },
  ];

  const handleAuthClick = (mode: 'signup' | 'login') => {
    setAuthMode(mode);
    setIsAuthDialogOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center p-6 bg-startsnap-candlelight shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a]">
      <div className="flex items-center justify-between w-full max-w-screen-2xl">
        <div className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-3xl leading-9">
          startsnap.fun
        </div>

        <div className="flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
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
            </NavigationMenuList>
          </NavigationMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="w-10 h-10 border-2 border-gray-800 cursor-pointer hover:border-startsnap-french-rose transition-colors">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
      />
    </header>
  );
};