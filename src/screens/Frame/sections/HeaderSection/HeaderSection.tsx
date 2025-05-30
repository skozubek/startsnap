import React from "react";
import { Button } from "../../../../components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";

export const HeaderSection = (): JSX.Element => {
  // Navigation links data
  const navLinks = [
    { title: "Feed", href: "#" },
    { title: "Submit StartSnap", href: "#" },
    { title: "Profile", href: "#" },
  ];

  return (
    <header className="w-full flex justify-center p-6 bg-startsnap-candlelight shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a]">
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
                    className="font-startsnap-semantic-link text-startsnap-oxford-blue text-[length:var(--startsnap-semantic-link-font-size)] tracking-[var(--startsnap-semantic-link-letter-spacing)] leading-[var(--startsnap-semantic-link-line-height)]"
                  >
                    {link.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            variant="outline"
            className="startsnap-button bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-base px-[26px] py-3.5 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
          >
            Login
          </Button>

          <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-base px-[26px] py-3.5 rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};
