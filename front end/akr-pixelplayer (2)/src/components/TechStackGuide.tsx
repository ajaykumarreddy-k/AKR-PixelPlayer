import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const techFeatures = [
  {
    id: 'engine',
    label: 'Media3 ExoPlayer',
    title: 'High-Res Playback',
    description: 'At the core lies Media3 ExoPlayer coupled with FFmpeg, enabling gapless, high-fidelity local playback across all major audio formats.',
    color: '#6366f1',
    textColor: '#ffffff'
  },
  {
    id: 'architecture',
    label: 'Jetpack Compose',
    title: 'Modern UI',
    description: 'Constructed entirely in Kotlin utilizing Jetpack Compose and Material You, driving a fluid, responsive, and deeply customizable visual layer.',
    color: '#06b6d4',
    textColor: '#ffffff'
  },
  {
    id: 'playlists',
    label: 'Playlist Import',
    title: 'Extensive Integration',
    description: 'Easily import and parse playlist formats (M3U, PLS) and link Spotify or YouTube Music playlists directly.',
    color: '#a855f7',
    textColor: '#ffffff'
  },
  {
    id: 'ai',
    label: 'Generative AI',
    title: 'Smart Features',
    description: 'Empowered by local on-device generative models for natural-language playlist creation and real-time synchronized lyrics translation.',
    color: '#10b981',
    textColor: '#ffffff'
  },
  {
    id: 'wear',
    label: 'Wear OS',
    title: 'Wrist Companion',
    description: 'A native companion leveraging the same robust architecture for offline wrist playback, dynamic output routing, and remote control.',
    color: '#f59e0b',
    textColor: '#ffffff'
  }
];

export default function TechStackGuide() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="glass-panel w-full text-white flex flex-col md:flex-row min-h-[500px] md:h-[700px] overflow-hidden mx-auto relative z-10 p-2 md:p-4 bg-transparent group rounded-[2.5rem]">
      
      {/* Dynamic Left Panel */}
      <div className="flex-1 p-8 md:p-12 lg:p-20 flex flex-col relative shrink-0 z-10 h-full bg-white/5 rounded-[2rem] border border-white/10 transition-all duration-500">
          <div className="flex items-center gap-4 mb-auto">
              {/* Dynamic Dot */}
              <div 
                className="w-5 h-5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-500" 
                style={{ backgroundColor: techFeatures[activeIndex].color, boxShadow: `0 0 20px 2px ${techFeatures[activeIndex].color}` }}
              ></div>
              <span className="font-black tracking-widest uppercase text-sm text-white/80">
                Technical Foundation
              </span>
          </div>

          <div className="relative h-full flex flex-col justify-center mt-12 mb-12">
              <AnimatePresence mode="wait">
                  <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="w-full space-y-6"
                  >
                     <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white/40 uppercase">
                        {techFeatures[activeIndex].title}
                     </h3>
                     <h2 className="text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[3.2rem] font-black tracking-tighter leading-[1.1] text-white">
                        {techFeatures[activeIndex].description}
                     </h2>
                  </motion.div>
              </AnimatePresence>
          </div>

          <div className="mt-auto flex items-center">
            <span 
              className="inline-block py-3.5 px-8 text-sm md:text-base font-black border border-white/15 rounded-full bg-white/5 text-white/90 shadow-lg"
            >
                Powered by {techFeatures[activeIndex].label}
            </span>
          </div>
      </div>

      {/* Interactive Right Color Bands */}
      <div className="flex flex-row md:flex-col lg:flex-row h-24 md:h-full w-full md:w-28 lg:w-auto shrink-0 md:pl-4 z-0 gap-2 md:gap-4 mt-4 md:mt-0">
         {techFeatures.map((feature, idx) => {
           const isActive = activeIndex === idx;
           return (
             <button
               key={feature.id}
               onMouseEnter={() => setActiveIndex(idx)}
               onClick={() => setActiveIndex(idx)}
               className="relative flex flex-col items-center justify-center lg:justify-end cursor-pointer h-full transition-all duration-500 ease-out md:w-full lg:w-[6.5rem] rounded-[1.5rem] md:rounded-[2rem] border border-white/10 hover:border-white/20"
               style={{
                  flexGrow: isActive ? 1.5 : 1,
                  backgroundColor: isActive ? feature.color : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? feature.textColor : 'rgba(255, 255, 255, 0.6)',
                  opacity: 1,
                  flexBasis: 0,
                  boxShadow: isActive ? `0 0 30px -5px ${feature.color}` : 'none',
                  transform: isActive ? 'scale(0.98)' : 'scale(1)',
               }}
             >
               {/* Desktop: Vertical Text */}
               <div className="hidden lg:block mb-12 whitespace-nowrap transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                 <span className={`font-black ${isActive ? 'opacity-100' : 'opacity-70'} text-lg tracking-widest uppercase transition-opacity duration-300`}>
                    {feature.label}
                 </span>
               </div>
               
               {/* Mobile/Tablet: Centered Number Index */}
               <div className="lg:hidden flex items-center justify-center h-full w-full px-2">
                 <span className={`font-black ${isActive ? 'opacity-100 scale-110' : 'opacity-50'} text-2xl leading-tight transition-all duration-300`}>
                    0{idx + 1}
                 </span>
               </div>
             </button>
           )
         })}
       </div>
    </div>
  );
}
