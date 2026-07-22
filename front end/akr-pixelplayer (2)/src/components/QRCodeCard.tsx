import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw, Copy, Check, Smartphone, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRCodeCardProps {
  url?: string;
  className?: string;
}

export default function QRCodeCard({
  url = "https://github.com/ajaykumarreddy-k/AKR-Music-Mix/releases/latest",
  className = ""
}: QRCodeCardProps) {
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      
      {/* Header Label matching Canva screenshot */}
      <div className="flex items-center gap-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#111111] font-sans">
          Download
        </h2>
        <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-400" /> APK v1.0.0
        </span>
      </div>

      {/* Main Canva-Style Black Box Container */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative bg-black text-white p-5 sm:p-6 rounded-2xl shadow-2xl border border-black/20 flex flex-col items-center justify-between w-full max-w-[280px] sm:max-w-[320px] select-none group"
      >
        {/* Top Status & Canva Ask Canva Pill */}
        <div className="w-full flex items-center justify-between mb-4 text-xs font-semibold text-white/70 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-mono tracking-wider text-emerald-400 font-bold uppercase">Ready to Scan</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-full text-[10px] cursor-pointer" onClick={handleCopy}>
            <Smartphone className="w-3 h-3 text-white" />
            <span>Scan or Tap</span>
          </div>
        </div>

        {/* The Highlighted "Qr Code" Box Frame - Exact Canvas Selection Aesthetic */}
        <div className="relative p-2.5 bg-white rounded-xl shadow-inner my-2 cursor-pointer group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all">
          
          {/* Canvas Purple Selection Box Overlay */}
          <div className="absolute -inset-1.5 border-2 border-[#9333ea] rounded-xl pointer-events-none z-20 flex items-center justify-center">
            {/* Selection Handle Dots */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#9333ea] rounded-full shadow-sm"></div>
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#9333ea] rounded-full shadow-sm"></div>
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#9333ea] rounded-full shadow-sm"></div>
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#9333ea] rounded-full shadow-sm"></div>

            {/* Canvas "Qr Code" Tag Pill */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#9333ea] text-white text-[11px] font-extrabold px-3.5 py-0.5 rounded-md shadow-md tracking-wider uppercase flex items-center gap-1 whitespace-nowrap z-30">
              <span>Qr Code</span>
            </div>
          </div>

          {/* QR Code Graphic Render */}
          <div className="w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] flex items-center justify-center bg-white rounded-lg p-2 overflow-hidden">
            {qrSvg ? (
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="w-full h-full bg-zinc-100 animate-pulse rounded flex items-center justify-center text-zinc-400 text-xs font-mono">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {/* Canvas Toolbar Buttons (Refresh / Transform Controls from Screenshot) */}
        <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handleRefresh}
            title="Refresh QR Code"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-white/90 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            title="Copy Release Link"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-bold text-white/90"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy URL</span>
              </>
            )}
          </button>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Open Release Page"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-white/90 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Direct APK Download Button */}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 w-full bg-white hover:bg-zinc-100 text-black py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 group-hover:bg-yellow-400 group-hover:text-black"
        >
          <Download className="w-4 h-4" />
          <span>Download APK File</span>
        </a>

      </motion.div>
    </div>
  );
}
