import React from "react";
import { FaXTwitter, FaInstagram, FaYoutube } from "react-icons/fa6";

export const FooterSection = (): JSX.Element => {
  // Footer navigation links data
  const footerLinks = [
    { title: "About", href: "#" },
    { title: "Terms", href: "#" },
    { title: "Privacy", href: "#" },
  ];

  // Social media links
  const socialLinks = [
    { icon: FaXTwitter, href: "#", label: "X (Twitter)" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="flex flex-col w-full items-center p-12 bg-startsnap-beige border-t-2 border-gray-200">
      <div className="relative w-full max-w-screen-2xl flex flex-col items-center gap-8">
        {/* Social Media Icons */}
        <div className="flex items-center gap-8">
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={index}
                href={link.href}
                aria-label={link.label}
                className="text-startsnap-ebony-clay hover:text-startsnap-french-rose transition-colors"
              >
                <Icon size={32} />
              </a>
            );
          })}
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