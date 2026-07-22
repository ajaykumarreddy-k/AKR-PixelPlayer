import { useState, useEffect } from 'react';
import { Github, Play, Download, Music, Sparkles, Layers, Menu, X, ListMusic, ArrowRight, Zap, QrCode } from 'lucide-react';
import PixelFooter from './components/PixelFooter';
import QRCodeCard from './components/QRCodeCard';
import { motion, AnimatePresence } from 'motion/react';
import BlindsTextReveal from './BlindsTextReveal';
import LoadingScreen from './components/LoadingScreen';

// Import App Screenshots directly for 100% reliable Vite bundling and dev server rendering
import screenshot1 from '../images/screenshot1.jpg';
import screenshot2 from '../images/screenshot2.jpg';
import screenshot3 from '../images/screenshot3.jpg';
import waImage45 from '../images/WhatsApp Image 2026-06-08 at 18.50.45.jpeg';
import waImage46 from '../images/WhatsApp Image 2026-06-08 at 18.50.46.jpeg';
import waImage46_2 from '../images/WhatsApp Image 2026-06-08 at 18.50.46 (2).jpeg';
import waImage46_1 from '../images/WhatsApp Image 2026-06-08 at 18.50.46 (1).jpeg';

export default function App() {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const appScreens = [
    { title: "Home / Discover", path: screenshot1 },
    { title: "Now Playing (Waveform)", path: screenshot2 },
    { title: "Library Tracks", path: screenshot3 },
    { title: "Now Playing (Treachery)", path: waImage45 },
    { title: "Playlist Details", path: waImage46 },
    { title: "Search Input View", path: waImage46_2 },
    { title: "Playlist Import Modal", path: waImage46_1 }
  ];

  const categories = [
    { name: 'Local Bit-Perfect Playback', desc: 'Gapless, high-fidelity audio rendering powered by Media3 ExoPlayer & native FFmpeg decoders.', icon: <Play className="w-6 h-6 text-[#111111]" /> },
    { name: 'Universal Playlist Import', desc: 'Seamlessly import and parse Spotify, YouTube Music, and local M3U/PLS files.', icon: <ListMusic className="w-6 h-6 text-[#111111]" /> },
    { name: 'Standalone Wear OS Sync', desc: 'Dynamic routing and standalone offline playback directly on your smart watch wrist.', icon: <Layers className="w-6 h-6 text-[#111111]" /> },
    { name: 'On-Device AI Playlists', desc: 'Natural language prompts turn into perfectly curated mixes translated in real-time.', icon: <Sparkles className="w-6 h-6 text-[#111111]" /> }
  ];

  // Auto cycle screens every 4 seconds unless clicked
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScreenIndex((prevIndex) => (prevIndex + 1) % appScreens.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleNextScreen = () => {
    setCurrentScreenIndex((prevIndex) => (prevIndex + 1) % appScreens.length);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111] font-sans flex flex-col relative overflow-x-hidden selection:bg-[#111111] selection:text-white">

      {/* Intro Counting Loader from AKR-Inspo */}
      <LoadingScreen
        backgroundColor="#000000"
        swipeDuration={800}
        countSpeed={16}
      />


      {/* Fixed Header Locked on Scroll (Exact Ctrl Style) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent h-[90px] flex justify-between items-center px-6 sm:px-10 md:px-16 pointer-events-none">
        
        {/* Left: Brand Logo & Wordmark */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3.5 cursor-pointer group pointer-events-auto"
        >
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white overflow-hidden shadow-md group-hover:scale-105 transition-transform">
            <img src="/Music Logo .png" className="w-full h-full object-cover" alt="AKR Logo" />
          </div>
          <span className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
            AKR-Music
          </span>
        </motion.div>

        {/* Center: Floating Rounded Glass Navigation Bar (Locked in Place on Scroll) */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md border border-black/10 px-6 py-2.5 rounded-full shadow-md text-xs sm:text-sm font-semibold text-[#111111]/70 pointer-events-auto hover:bg-white transition-all"
        >
          <a href="#features" className="hover:text-black px-3.5 py-1 transition-colors">Features</a>
          <span className="text-black/20 font-light">|</span>
          <a href="#playlists" className="hover:text-black px-3.5 py-1 transition-colors">Platforms</a>
          <span className="text-black/20 font-light">|</span>
          <a href="#audio-engine" className="hover:text-black px-3.5 py-1 transition-colors">Audio Engine</a>
          <span className="text-black/20 font-light">|</span>
          <a href="#creator" className="hover:text-black px-3.5 py-1 transition-colors">Creator</a>
          <span className="text-black/20 font-light">|</span>
          <a href="#credits" className="hover:text-black px-3.5 py-1 transition-colors">Credits</a>
        </motion.nav>

        {/* Right: Sleek Black Download Pill Button */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 pointer-events-auto"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/ajaykumarreddy-k/AKR-Music-Mix/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="bg-[#111111] hover:bg-black text-white px-6 sm:px-7 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md group"
          >
            <span>Download</span>
          </motion.a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            className="md:hidden p-2.5 hover:bg-black/5 rounded-full transition-colors pointer-events-auto"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </motion.div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[90px] left-0 w-full bg-[#fafafa]/98 backdrop-blur-xl border-b border-black/10 z-40 px-6 py-8 flex flex-col gap-5 text-center shadow-xl"
          >
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold tracking-tight text-[#111111]">Features</a>
            <a href="#playlists" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold tracking-tight text-[#111111]">Platforms</a>
            <a href="#audio-engine" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold tracking-tight text-[#111111]">Audio Engine</a>
            <a href="#creator" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold tracking-tight text-[#111111]">Creator</a>
            <a href="#credits" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold tracking-tight text-[#111111]">Credits</a>
            <a
              href="https://github.com/ajaykumarreddy-k/AKR-PixelPlayer"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center py-3.5 rounded-full bg-[#111111] text-white font-bold text-sm tracking-wider uppercase mt-2"
            >
              <Github className="w-4 h-4 mr-2" /> GitHub Source
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section in Spacious, Pixel-Perfect Ctrl Reference Style */}
      <section className="pt-20 sm:pt-32 md:pt-40 pb-20 sm:pb-28 px-6 sm:px-10 md:px-16 max-w-[1600px] mx-auto w-full flex flex-col items-center text-center">
        
        {/* Centered Kicker / Subtitle Text with Extra Spacing */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-[#111111]/70 font-medium tracking-tight mb-8 sm:mb-10 flex items-center justify-center gap-2.5"
        >
          <span>Turning audio into pure energy</span>
          <span className="font-serif italic font-normal text-lg sm:text-xl text-black">ⓐ</span>
        </motion.p>

        {/* Main Hero Headline: AKR [Logo Icon Box] Music. (Flawlessly Spaced & Aligned) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center flex-wrap gap-4 sm:gap-8 md:gap-10 my-4 sm:my-8 text-[#111111] font-black text-[3.8rem] sm:text-[6.8rem] md:text-[8.8rem] lg:text-[11rem] tracking-tight leading-none font-sans select-none"
        >
          <span>AKR</span>
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-18 h-18 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-black text-white rounded-[28px] sm:rounded-[36px] md:rounded-[44px] flex items-center justify-center shadow-2xl overflow-hidden p-3 sm:p-4 md:p-5 border-2 border-black/10 cursor-pointer my-1"
          >
            <img src="/Music Logo .png" className="w-full h-full object-cover rounded-2xl sm:rounded-3xl" alt="AKR Logo" />
          </motion.div>
          <span>Music.</span>
        </motion.div>

        {/* Centered Description Paragraph with Generous Margins & Line Height */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-[#111111]/75 font-medium leading-relaxed sm:leading-loose max-w-2xl mt-8 sm:mt-10 mb-10 sm:mb-14 px-4"
        >
          AKR Pixel Player is an open-source media player studio specializing in gapless bit-perfect playback, Wear OS watch sync, and generative AI playlist mixes.
        </motion.p>

        {/* Centered Download CTA Pill Button Row with Room to Breathe */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-6"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/ajaykumarreddy-k/AKR-Music-Mix/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-9 py-4.5 rounded-full font-bold text-sm sm:text-base flex items-center gap-3.5 transition-all duration-300 shadow-xl border border-black/10 group cursor-pointer"
          >
            {/* Pill graphics inside button matching Ctrl reference */}
            <div className="flex items-center -space-x-1 bg-black/10 p-1 rounded-full">
              <div className="w-3.5 h-3.5 rounded-full bg-white/90"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-black"></div>
            </div>
            <span>Download Player APK</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Toggle Scan QR Code Modal Button */}
          <button
            onClick={() => setShowQrModal(!showQrModal)}
            className="bg-white hover:bg-black hover:text-white text-[#111111] border border-black/15 px-7 py-4 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all duration-300 shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </motion.div>

        {/* QR Code Modal Drawer overlay if opened */}
        <AnimatePresence>
          {showQrModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mt-12 relative z-30"
            >
              <QRCodeCard url="https://github.com/ajaykumarreddy-k/AKR-Music-Mix/releases/latest" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Showcase Tiles Row right below Hero CTA with Generous Top Spacing */}
        <div id="showcase-tiles" className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 w-full mt-28 sm:mt-36 md:mt-44 text-left">
          
          {/* Tile 01: Interactive Showcase */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="md:col-span-12 lg:col-span-4 bg-[#090a0f] text-white p-9 sm:p-11 capsule-card flex flex-col justify-between min-h-[580px] relative overflow-hidden shadow-2xl group cursor-pointer"
          >
            <div className="flex justify-between items-start z-10">
              <span className="text-xs font-black uppercase tracking-widest text-white/60 bg-white/10 px-3.5 py-1.5 rounded-full">
                Interactive Showcase
              </span>
              <span className="text-2xl font-serif italic text-white/40">01</span>
            </div>

            {/* Phone Mockup Showcase */}
            <div className="my-8 flex flex-col items-center justify-center relative z-10">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="relative w-[220px] h-[440px] sm:w-[240px] sm:h-[480px] bg-black rounded-[36px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/15 overflow-hidden transition-all duration-500"
              >
                {/* Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-6 h-0.75 bg-zinc-800 rounded-full"></div>
                </div>

                {/* Screen Area */}
                <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-zinc-950">
                  <img
                    src={appScreens[currentScreenIndex].path}
                    alt={appScreens[currentScreenIndex].title}
                    className="w-full h-full object-cover select-none cursor-pointer active:scale-95 transition-all duration-300"
                    onClick={handleNextScreen}
                  />

                  {/* Tap Screen Badge */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[9px] text-white/90 border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase font-bold">
                    Tap to Cycle
                  </div>
                </div>
              </motion.div>

              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5 mt-5">
                {appScreens.map((screen, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentScreenIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentScreenIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`}
                    title={screen.title}
                  />
                ))}
              </div>
            </div>

            <div className="z-10">
              <h3 className="text-xl font-bold tracking-tight text-white">{appScreens[currentScreenIndex].title}</h3>
              <p className="text-xs text-white/60 font-medium mt-1">Click screen to cycle through live app interface views.</p>
            </div>
          </motion.div>

          {/* Tile 02: Audio Engine (Emerald Green) */}
          <motion.div 
            id="audio-engine"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="md:col-span-6 lg:col-span-4 bg-[#059669] text-white p-9 sm:p-11 capsule-card flex flex-col justify-between min-h-[580px] shadow-xl group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-widest bg-black/20 px-3.5 py-1.5 rounded-full">
                Audio Engine
              </span>
              <span className="text-2xl font-serif italic text-white/60">02</span>
            </div>

            <div className="my-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif leading-tight font-normal">
                Bit-Perfect & Gapless Playback Engine
              </h2>
              <p className="text-sm md:text-base font-medium text-white/80 leading-relaxed">
                Powered by Media3 ExoPlayer coupled with custom native FFmpeg decoders for uncompressed high-resolution audio.
              </p>
            </div>

            <div className="pt-4 border-t border-white/20 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span>Bitrate: 32-bit / 384kHz</span>
              <span>Gapless</span>
            </div>
          </motion.div>

          {/* Tile 03: Platforms (Amber/Yellow) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{ y: -6 }}
            className="md:col-span-6 lg:col-span-4 bg-[#f59e0b] text-[#111111] p-9 sm:p-11 capsule-card flex flex-col justify-between min-h-[580px] shadow-xl group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-widest bg-black/10 px-3.5 py-1.5 rounded-full">
                Platforms
              </span>
              <span className="text-2xl font-serif italic text-[#111111]/40">03</span>
            </div>

            <div className="my-auto space-y-6">
              <div className="space-y-3">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-black/10 flex items-center justify-between shadow-sm">
                  <span className="font-bold text-sm">YouTube Music</span>
                  <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> ACTIVE
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-black/10 flex items-center justify-between opacity-80">
                  <span className="font-bold text-sm">Spotify Sync</span>
                  <span className="text-[10px] bg-black/10 font-bold px-2 py-0.5 rounded-full">SOON</span>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-black/10 flex items-center justify-between opacity-80">
                  <span className="font-bold text-sm">Apple Music</span>
                  <span className="text-[10px] bg-black/10 font-bold px-2 py-0.5 rounded-full">SOON</span>
                </div>
              </div>

              <h3 className="text-2xl font-serif font-bold">Universal Streaming & Playlist Sync</h3>
            </div>

            <a
              href="#playlists"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111] hover:underline"
            >
              <span>View Platform Specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

        </div>

      </section>

      {/* Marquee Ticker Banner */}
      <div className="w-full overflow-hidden my-20 sm:my-28 py-6 border-y border-black/15 bg-white/60 backdrop-blur-sm">
        <div className="animate-marquee flex items-center gap-16 text-[#111111]">
          {/* Loop Group 1 */}
          <div className="flex items-center gap-16 font-sans font-black text-xl tracking-tighter uppercase">
            <span>AKR MUSIC ENGINE</span>
            <span>•</span>
            <span>AD-FREE YOUTUBE MUSIC</span>
            <span>•</span>
            <span>GAPLESS BIT-PERFECT AUDIO</span>
            <span>•</span>
            <span>WEAR OS SYNC</span>
            <span>•</span>
            <span>GENERATIVE AI PLAYLISTS</span>
            <span>•</span>
          </div>

          {/* Loop Group 2 */}
          <div className="flex items-center gap-16 font-sans font-black text-xl tracking-tighter uppercase">
            <span>AKR MUSIC ENGINE</span>
            <span>•</span>
            <span>AD-FREE YOUTUBE MUSIC</span>
            <span>•</span>
            <span>GAPLESS BIT-PERFECT AUDIO</span>
            <span>•</span>
            <span>WEAR OS SYNC</span>
            <span>•</span>
            <span>GENERATIVE AI PLAYLISTS</span>
            <span>•</span>
          </div>
        </div>
      </div>

      {/* Hyper-realistic 3D Brushed Metal Plaque Section */}
      <section className="py-20 sm:py-28 px-6 max-w-[1600px] mx-auto w-full flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="plaque-container w-[350px] md:w-[440px] h-auto p-10 flex flex-col relative z-20"
        >
          {/* Embossed metallic logos top right */}
          <div className="absolute top-8 right-8 flex gap-2 opacity-70">
            <div className="w-6 h-6 border-[1.5px] border-[#444] rounded-full shadow-[inset_1px_1px_1px_rgba(255,255,255,0.9),1px_1px_0px_rgba(255,255,255,0.9)]"></div>
            <div className="w-6 h-6 border-[1.5px] border-[#444] rounded-full shadow-[inset_1px_1px_1px_rgba(255,255,255,0.9),1px_1px_0px_rgba(255,255,255,0.9)] -ml-4"></div>
          </div>

          {/* Main Plaque Title */}
          <BlindsTextReveal
            text="AKR PIXEL PLAYER"
            color="#222"
            blindsColor="#888888"
            tag="h3"
            direction="left-to-right"
            trigger="Scroll"
            scrollTriggerPosition="center"
            reverse={true}
            staggerAmount={0.08}
            className="engraved-text font-serif text-[2.5rem] leading-[0.95] font-normal mb-8 uppercase tracking-widest text-left mt-2"
          />
          
          {/* Separator Line */}
          <div className="w-full h-[2px] engraved-line mb-6"></div>
          
          {/* Plaque Details */}
          <div className="flex flex-col gap-6 text-left w-full">
            <div>
              <p className="engraved-text text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                Made Possible With:<br />Media3 ExoPlayer & Native FFmpeg
              </p>
            </div>
            
            <div className="w-full h-[2px] engraved-line"></div>
            
            <div>
              <p className="engraved-text text-[11px] uppercase font-semibold tracking-wider leading-relaxed">
                Crafted and milled from solid<br />aluminum, reflecting inherent<br />technological audio aesthetics.
              </p>
            </div>
          </div>
          
          {/* Bottom Metadata */}
          <div className="mt-8 flex justify-between engraved-text text-[10px] font-bold tracking-widest border-t border-[#888]/50 pt-4">
            <span>EDITION: 1.0</span>
            <span>YEAR: 2026</span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
        <div className="text-center mb-20">
          <BlindsTextReveal
            text="Features"
            color="#111111"
            blindsColor="#8B5CF6"
            tag="h2"
            direction="left-to-right"
            trigger="Scroll"
            scrollTriggerPosition="center"
            reverse={true}
            staggerAmount={0.06}
            className="font-pixel text-7xl md:text-[8.5rem] pixel-heading text-center"
            font={{ fontFamily: 'VT323, monospace', textAlign: 'center' }}
          />
          <p className="text-lg md:text-xl text-[#111111]/70 max-w-2xl mx-auto mt-4 font-medium">
            Core capabilities designed for modern high-resolution mobile audio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="bg-white border border-black/10 p-10 rounded-[2.5rem] flex flex-col justify-between min-h-[280px] hover:border-black hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="text-4xl font-black text-black/10 select-none">0{i + 1}</span>
              </div>
              <div className="mt-10 space-y-3">
                <h3 className="text-2xl font-bold tracking-tight text-[#111111]">{cat.name}</h3>
                <p className="text-[#111111]/70 text-base leading-relaxed font-medium">{cat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Supported Platforms Section */}
      <section id="playlists" className="py-24 sm:py-32 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
        <div className="text-center mb-20">
          <BlindsTextReveal
            text="Platforms"
            color="#111111"
            blindsColor="#EC4899"
            tag="h2"
            direction="right-to-left"
            animationMode="in-out"
            trigger="Scroll"
            scrollTriggerPosition="center"
            reverse={true}
            staggerAmount={0.06}
            className="font-pixel text-7xl md:text-[8.5rem] pixel-heading text-center"
            font={{ fontFamily: 'VT323, monospace', textAlign: 'center' }}
          />
          <p className="text-lg md:text-xl text-[#111111]/70 max-w-2xl mx-auto mt-4 font-medium">
            Supported Playlist Sources & Streaming Integrations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {/* YouTube Music */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="bg-white border border-black/10 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[300px] shadow-sm hover:border-red-500 hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-500" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107A30.082 30.082 0 0 0 0 12a30.082 30.082 0 0 0 .502 5.837 3.002 3.002 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107A30.082 30.082 0 0 0 24 12a30.082 30.082 0 0 0-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Active
              </span>
            </div>
            <div className="space-y-2 mt-8">
              <h3 className="text-xl font-bold tracking-tight text-[#111111]">YouTube Music</h3>
              <p className="text-[#111111]/70 text-xs leading-relaxed font-medium">
                Completely ad-free streaming and high-fidelity local caching.
              </p>
            </div>
          </motion.div>

          {/* Spotify */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-white border border-black/10 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[300px] shadow-sm hover:border-[#1db954] hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1db954]" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0zm5.495 17.305c-.216.353-.677.465-1.03.247-2.878-1.76-6.5-2.158-10.766-1.185-.403.092-.81-.162-.903-.565-.092-.403.162-.81.565-.903 4.67-1.07 8.665-.623 11.887 1.35.353.218.465.677.247 1.03zm1.468-3.263c-.273.443-.855.584-1.298.31-3.292-2.023-8.31-2.61-12.193-1.432-.497.15-1.023-.13-1.173-.627-.15-.497.13-1.024.627-1.173 4.438-1.348 9.96-.69 13.728 1.625.443.272.584.855.31 1.297zm.126-3.395C15.203 8.32 8.784 8.1 5.02 9.243c-.606.184-1.247-.157-1.43-.763-.184-.606.157-1.247.763-1.43 4.318-1.31 11.41-1.056 16.035 1.688.547.324.727 1.028.403 1.575-.323.547-1.028.727-1.575.403z" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111]/50 bg-black/5 border border-black/10 px-3 py-1 rounded-full">
                Soon
              </span>
            </div>
            <div className="space-y-2 mt-8">
              <h3 className="text-xl font-bold tracking-tight text-[#111111]">Spotify</h3>
              <p className="text-[#111111]/70 text-xs leading-relaxed font-medium">
                Import playlists using intelligent metadata matching.
              </p>
            </div>
          </motion.div>

          {/* Apple Music */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="bg-white border border-black/10 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[300px] shadow-sm hover:border-[#fa243c] hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#fa243c]" fill="currentColor">
                  <path d="M19.004 3.005a.75.75 0 0 0-.915-.558l-8 2A.75.75 0 0 0 9.5 6.18v8.625c-.65-.436-1.464-.68-2.35-.68C5.29 14.125 3.75 15.468 3.75 17.125s1.54 3 3.4 3 3.4-1.343 3.4-3V7.93l7-1.75v5.625c-.65-.436-1.464-.68-2.35-.68-1.86 0-3.4 1.343-3.4 3s1.54 3 3.4 3 3.4-1.343 3.4-3V3.75a.747.747 0 0 0-.196-.745z" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111]/50 bg-black/5 border border-black/10 px-3 py-1 rounded-full">
                Soon
              </span>
            </div>
            <div className="space-y-2 mt-8">
              <h3 className="text-xl font-bold tracking-tight text-[#111111]">Apple Music</h3>
              <p className="text-[#111111]/70 text-xs leading-relaxed font-medium">
                Full catalog synchronization & playlist recreation.
              </p>
            </div>
          </motion.div>

          {/* JioSaavn */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -6 }}
            className="bg-white border border-black/10 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[300px] shadow-sm hover:border-[#00b2f3] hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#00b2f3]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12a4 4 0 0 1 8 0" />
                  <path d="M6 12a6 6 0 0 1 12 0" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#111111]/50 bg-black/5 border border-black/10 px-3 py-1 rounded-full">
                Soon
              </span>
            </div>
            <div className="space-y-2 mt-8">
              <h3 className="text-xl font-bold tracking-tight text-[#111111]">JioSaavn</h3>
              <p className="text-[#111111]/70 text-xs leading-relaxed font-medium">
                Stream regional tracks & map local playlists.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creator Spotlight Section */}
      <section id="creator" className="py-24 sm:py-32 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
        <div className="text-center mb-20">
          <BlindsTextReveal
            text="Creator"
            color="#111111"
            blindsColor="#F59E0B"
            tag="h2"
            direction="left-to-right"
            alternate={true}
            trigger="Scroll"
            scrollTriggerPosition="center"
            reverse={true}
            staggerAmount={0.06}
            className="font-pixel text-7xl md:text-[8.5rem] pixel-heading text-center"
            font={{ fontFamily: 'VT323, monospace', textAlign: 'center' }}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#111111] text-white p-8 sm:p-12 md:p-16 rounded-[3rem] shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative overflow-hidden"
        >
          <div className="lg:col-span-5">
            <a
              href="https://github.com/ajaykumarreddy-k"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/10 border border-white/20 p-8 rounded-[2.5rem] hover:bg-white/15 transition-all group"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 bg-white/20 border border-white/30 px-3.5 py-1 rounded-full">
                  Lead Developer
                </span>
                <h3 className="text-3xl font-black text-white group-hover:text-white/80 transition-colors">
                  ajaykumarreddy-k
                </h3>
                <p className="text-white/70 text-xs font-medium">
                  Creator of AKR Pixel Player Engine
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
                <span>View GitHub Profile</span>
                <Github className="w-4 h-4" />
              </div>
            </a>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              The Man Behind AKR Pixel Player
            </h3>
            <p className="text-xl italic font-serif text-white/90 leading-relaxed">
              "Uniting custom local Media3 ExoPlayer engines with automated playlist integrations for the ultimate audio player."
            </p>
            <p className="text-white/70 text-base leading-relaxed font-medium">
              Focusing on bit-perfect rendering, low-latency audio sync, and modern gesture-driven layout principles to build a seamless player that feels right at home on every device.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Credits & Acknowledgments Section */}
      <section id="credits" className="py-24 sm:py-32 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
        <div className="text-center mb-20">
          <BlindsTextReveal
            text="Credits"
            color="#111111"
            blindsColor="#10B981"
            tag="h2"
            direction="top-to-bottom"
            lineOrder="center-out"
            trigger="Scroll"
            scrollTriggerPosition="center"
            reverse={true}
            staggerAmount={0.06}
            className="font-pixel text-7xl md:text-[8.5rem] pixel-heading text-center"
            font={{ fontFamily: 'VT323, monospace', textAlign: 'center' }}
          />
          <p className="text-lg md:text-xl text-[#111111]/80 max-w-3xl mx-auto mt-4 font-medium">
            This project is a modified and unified version of two exceptional open-source music applications. Special thanks and credits go to:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PixelPlayer by theovilardo */}
          <motion.a
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ duration: 0.5 }}
            href="https://github.com/theovilardo/PixelPlayer"
            target="_blank"
            rel="noreferrer"
            className="bg-white border border-black/10 p-8 sm:p-10 rounded-[3rem] shadow-sm hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 group-hover:scale-110 transition-transform">
                <Github className="w-7 h-7 text-[#111111]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#111111] bg-black/5 border border-black/10 px-3.5 py-1.5 rounded-full">
                UI/UX & Playback Engine
              </span>
            </div>

            <div className="space-y-3 my-8">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] group-hover:text-black">
                PixelPlayer by theovilardo
              </h3>
              <p className="text-[#111111]/80 text-base leading-relaxed font-medium">
                For the beautiful Material 3 UI/UX foundation and local playback engine.
              </p>
            </div>

            <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#111111]">
              <span>View Repository</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>

          {/* Echo-Music by EchoMusicApp */}
          <motion.a
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            href="https://github.com/EchoMusicApp"
            target="_blank"
            rel="noreferrer"
            className="bg-white border border-black/10 p-8 sm:p-10 rounded-[3rem] shadow-sm hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 group-hover:scale-110 transition-transform">
                <Music className="w-7 h-7 text-[#111111]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#111111] bg-black/5 border border-black/10 px-3.5 py-1.5 rounded-full">
                Streaming & Lyrics Engine
              </span>
            </div>

            <div className="space-y-3 my-8">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] group-hover:text-black">
                Echo-Music by EchoMusicApp
              </h3>
              <p className="text-[#111111]/80 text-base leading-relaxed font-medium">
                For the advanced streaming integrations, scraper modules, and lyrics syncing.
              </p>
            </div>

            <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#111111]">
              <span>View Organization</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>
        </div>
      </section>

      {/* Footer Wrapper */}
      <div className="w-full bg-[#fafafa]">
        <PixelFooter />
      </div>

    </div>
  );
}
