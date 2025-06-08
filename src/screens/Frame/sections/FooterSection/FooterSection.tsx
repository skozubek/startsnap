/**
 * src/screens/Frame/sections/FooterSection/FooterSection.tsx
 * @description Footer component with social media links and site navigation
 */

import React from "react";
import { Link } from "react-router-dom";
import { FaXTwitter, FaInstagram, FaYoutube } from "react-icons/fa6";
import { IconType } from "react-icons";

/**
 * @description Renders the application footer with social media links and navigation
 * @returns {JSX.Element} Footer component with social media and navigation links
 */
export const FooterSection = (): JSX.Element => {
  // Footer navigation links data
  const footerLinks = [
    { title: "About", href: "#" },
    { title: "Terms", href: "/terms" },
    { title: "Privacy", href: "/privacy" },
  ];

  // Social media links
  const socialLinks: Array<{ icon: IconType; href: string; label: string }> = [
    { icon: FaXTwitter, href: "https://x.com/startsnapfun", label: "X (Twitter)" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="flex flex-col w-full items-center p-12 bg-startsnap-beige border-t-2 border-gray-200">
      <div className="relative w-full max-w-screen-2xl flex flex-col items-center gap-8">
        {/* Social Media Icons */}
        <div className="flex items-center gap-8">
          {socialLinks.map((link, index) => {
            const Icon = link.icon as React.ComponentType<{ size: number }>;
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
            link.href === "#" ? (
              <a
                key={index}
                href={link.href}
                className="font-['Roboto',Helvetica] font-normal text-startsnap-ebony-clay text-base text-center leading-6 hover:text-startsnap-french-rose transition-colors"
              >
                {link.title}
              </a>
            ) : (
              <Link
                key={index}
                to={link.href}
                className="font-['Roboto',Helvetica] font-normal text-startsnap-ebony-clay text-base text-center leading-6 hover:text-startsnap-french-rose transition-colors"
              >
                {link.title}
              </Link>
            )
          ))}
        </div>

        {/* Copyright */}
        <div className="font-['Roboto',Helvetica] font-normal text-startsnap-ebony-clay text-base text-center leading-6">
          © {new Date().getFullYear()} startsnap.fun - Fueling Creative Journeys.
        </div>
      </div>
    </footer>
  );
};