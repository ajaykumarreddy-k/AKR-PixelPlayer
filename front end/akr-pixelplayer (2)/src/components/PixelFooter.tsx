import React from "react";

const PixelFooter = () => {
  return (
    <footer className="w-full bg-[#f39c9c] text-[#223521] px-8 py-12 md:px-12 md:py-16 lg:px-16 lg:pt-20 lg:pb-10 rounded-t-[40px] max-w-[1920px] mx-auto overflow-hidden font-inter">
      {/* Top Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16 lg:mb-24">

        {/* Column 1: GitHub & Project Details */}
        <div className="col-span-1 lg:col-span-3">
          <h3 className="text-[#FFFDFB] text-[28px] font-bold mb-6 tracking-tight">GitHub</h3>

          <div className="mb-8 text-[15px] leading-[1.6] font-medium">
            <p>
              ajaykumarreddy-k<br />
              AKR-PixelPlayer<br />
              Open Source Media Player
            </p>
          </div>

          <div className="text-[15px] leading-[1.6] font-medium">
            <p>
              Download Latest APKs<br />
              v1.0.0 Release Branch<br />
              Ad-Free & Privacy-First
            </p>
          </div>
        </div>

        {/* Column 2: Say Hello & Social Links */}
        <div className="col-span-1 lg:col-span-2">
          <h3 className="text-[#FFFDFB] text-[28px] font-bold mb-6 tracking-tight">Say hello</h3>
          <a
            href="https://github.com/ajaykumarreddy-k/AKR-PixelPlayer/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[15px] font-medium leading-[1.6] mb-4 hover:opacity-70 transition-opacity cursor-pointer"
          >
            Report Issues
          </a>

          <div className="flex gap-4">
            {/* GitHub Link */}
            <a
              href="https://github.com/ajaykumarreddy-k/AKR-PixelPlayer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#FFFDFB] hover:scale-110 transition-transform duration-300"
              aria-label="GitHub Repository"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>

            {/* LinkedIn Link */}
            <a
              href="https://www.linkedin.com/in/ajay-kumar-reddy-krishnareddy-gari-a4885b282/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#FFFDFB] hover:scale-110 transition-transform duration-300"
              aria-label="LinkedIn Profile"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>

        {/* Column 3: Features Links */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
          <h3 className="text-[#FFFDFB] text-[28px] font-bold mb-6 tracking-tight">Features</h3>
          <ul className="space-y-3.5 text-[15px] font-medium">
            <li><a href="#features" className="hover:underline hover:opacity-70 transition-all">Local Playback</a></li>
            <li><a href="#playlists" className="hover:underline hover:opacity-70 transition-all">Import Playlists</a></li>
            <li><a href="#features" className="hover:underline hover:opacity-70 transition-all">Wear OS Sync</a></li>
            <li><a href="#features" className="hover:underline hover:opacity-70 transition-all">AI Playlists</a></li>
          </ul>
        </div>

        {/* Column 4: Quote, Download Button & Flower SVG */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-5 flex flex-col sm:flex-row justify-between items-start gap-8 lg:gap-4 relative">
          <div className="flex-1">
            <h2 className="font-serif-italic text-[32px] lg:text-[2.5rem] leading-[1.1] mb-8 max-w-[340px]">
              Bit-Perfect Playback.<br />Gapless audio, pure energy.
            </h2>
            <a
              href="https://github.com/ajaykumarreddy-k/AKR-Music-Mix/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#1B3B24] text-[#FFFDFB] px-8 py-3.5 rounded-full font-medium text-[15px] hover:bg-[#122818] transition-colors shadow-sm"
            >
              Download APK
            </a>
          </div>

          {/* Flower SVG */}
          <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 lg:-mt-2">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="text-[#FFFDFB] fill-current w-full h-full drop-shadow-sm">
              <defs>
                <mask id="flower-hole">
                  {/* The white rect reveals everything */}
                  <rect width="100" height="100" fill="white" />
                  {/* The black circle masks/cuts out the center */}
                  <circle cx="50" cy="50" r="15" fill="black" />
                </mask>
              </defs>
              <g mask="url(#flower-hole)">
                {/* 8 Overlapping Petals */}
                <circle cx="50" cy="18" r="18" />
                <circle cx="72.6" cy="27.4" r="18" />
                <circle cx="82" cy="50" r="18" />
                <circle cx="72.6" cy="72.6" r="18" />
                <circle cx="50" cy="82" r="18" />
                <circle cx="27.4" cy="72.6" r="18" />
                <circle cx="18" cy="50" r="18" />
                <circle cx="27.4" cy="27.4" r="18" />
                {/* Solid base to fill any microscopic gaps between petals */}
                <circle cx="50" cy="50" r="26" />
              </g>
            </svg>
          </div>
        </div>

      </div>

      {/* Middle Section: Giant Text Lockup */}
      <div className="w-full mt-12 lg:mt-24 mb-6 lg:mb-12">
        <h1 className="font-titan text-[#FFFDFB] uppercase flex flex-col leading-[0.8] tracking-[-0.01em] giant-text-container select-none">
          <span className="block">AKR</span>
          <span className="block">PIXELPLAYER</span>
        </h1>
      </div>

      {/* Bottom Legal & Links Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-[13px] md:text-[14px] font-medium pt-2 border-t border-[#223521]/15">

        {/* Copyright & Credits */}
        <div className="space-y-1.5 order-2 md:order-1">
          <p>© 2026 AKR Pixel Player</p>
          <a
            href="https://github.com/ajaykumarreddy-k"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] md:text-[12px] opacity-80 cursor-pointer hover:underline block"
          >
            Developed by ajaykumarreddy-k
          </a>
        </div>



      </div>
    </footer>
  );
};

export default PixelFooter;
