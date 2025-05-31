import React from "react";

export const FooterSection = (): JSX.Element => {
  // Footer navigation links data
  const footerLinks = [
    { title: "About", href: "#" },
    { title: "Terms", href: "#" },
    { title: "Privacy", href: "#" },
  ];

  // Social media links
  const socialLinks = [
    { icon: "logo_dev", href: "#", label: "X (Twitter)" },
    { icon: "photo_camera", href: "#", label: "Instagram" },
    { icon: "smart_display", href: "#", label: "YouTube" },
  ];

  return (
    <footer className="flex flex-col w-full items-center p-12 bg-startsnap-beige border-t-2 border-gray-200">
      <div className="relative w-full max-w-screen-2xl flex flex-col items-center gap-8">
        {/* Social Media Icons */}
        <div className="flex items-center gap-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              aria-label={link.label}
              className="text-startsnap-ebony-clay hover:text-startsnap-french-rose transition-colors"
            >
              <span className="material-icons text-3xl">{link.icon}</span>
            </a>
          ))}
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {footerLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="font-['Roboto',Helvetica] font-normal text-startsnap-ebony-clay text-base text-center leading-6 hover:text-startsnap-french-rose transition-colors"
            >
              {link.title}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="font-['Roboto',Helvetica] font-normal text-startsnap-ebony-clay text-base text-center leading-6">
          © 2024 startsnap.fun - Fueling Creative Journeys.
        </div>
      </div>
    </footer>
  );
};