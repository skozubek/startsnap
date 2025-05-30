import React from "react";

export const FooterSection = (): JSX.Element => {
  // Footer navigation links data
  const footerLinks = [
    { title: "About", href: "#" },
    { title: "Terms", href: "#" },
    { title: "Privacy", href: "#" },
  ];

  return (
    <footer className="flex flex-col w-full items-center p-8 bg-koniakowcomcandlelight">
      <div className="relative w-full max-w-screen-2xl flex flex-col items-center gap-4">
        <div className="font-['Roboto',Helvetica] font-normal text-koniakowcomebony-clay text-base text-center leading-6">
          © 2024 startsnap.fun - Fueling Creative Journeys.
        </div>

        <div className="flex items-center gap-6">
          {footerLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="font-['Roboto',Helvetica] font-normal text-koniakowcomebony-clay text-base text-center leading-6 hover:underline"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
