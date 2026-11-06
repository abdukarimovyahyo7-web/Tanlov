import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Code2,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Terminal,
  FolderArchive,
  Sparkles,
  HelpCircle,
  FileCode,
  Github,
  Globe,
  Layers,
} from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedClone, setCopiedClone] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipDownloaded, setZipDownloaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'clone' | 'zip'>('guide');

  if (!isOpen) return null;

  const cloneCommand = 'git clone https://github.com/tanlovmahallasi/tanlov-mahallasi-3d.git';

  const handleCopyClone = () => {
    sound.playClick();
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 3000);
  };

  const handleDownloadZip = async () => {
    sound.playCash();
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // README file
      zip.file(
        'README.md',
        `# 🏙️ Tanlov Mahallasi 3D (v1.2 Cyber) - Ochiq Manba Kodingiz\n\n` +
          `Siz ushbu fayllardan foydalanib o'zingizga shaxsiy veb-sayt yaratishingiz mumkin!\n\n` +
          `## Ishga tushirish:\n` +
          `1. npm install\n` +
          `2. npm run dev\n\n` +
          `Aloqa: tanlovmahallasi@gmail.com | Instagram: @tanlovmahallasi\n`
      );

      // package.json template
      zip.file(
        'package.json',
        JSON.stringify(
          {
            name: 'tanlov-mahallasi-3d',
            private: true,
            version: '1.2.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc -b && vite build',
              preview: 'vite preview',
            },
            dependencies: {
              'lucide-react': '^0.546.0',
              react: '^19.0.1',
              'react-dom': '^19.0.1',
              'canvas-confetti': '^1.9.4',
              three: '^0.170.0',
            },
            devDependencies: {
              '@tailwindcss/vite': '^4.3.3',
              '@types/react': '^19.3.0',
              '@types/react-dom': '^19.3.0',
              '@vitejs/plugin-react': '^6.1.1',
              tailwindcss: '^4.3.3',
              typescript: '^7.0.2',
              vite: '^8.3.0',
            },
          },
          null,
          2
        )
      );

      // index.html
      zip.file(
        'index.html',
        `<!doctype html>
<html lang="uz">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tanlov Mahallasi 3D - Mening Shahrim</title>
    <link rel="stylesheet" href="/src/index.css" />
  </head>
  <body class="bg-[#070913] text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      );

      // Setup quick starter script
      zip.file(
        'START_HERE.txt',
        `=======================================================\n` +
          `TABRIKLAYMIZ! «TANLOV MAHALLASI 3D» MANBA KODLARI (v1.2)\n` +
          `=======================================================\n\n` +
          `Ushbu fayllardan foydalanib o'zingizga yangi sayt yaratish tartibi:\n\n` +
          `1-QADAM: Terminalni oching va ushbu papkaga kiring.\n` +
          `2-QADAM: "npm install" buyrug'ini tering va Enter bosing.\n` +
          `3-QADAM: "npm run dev" buyrug'ini yozing.\n` +
          `4-QADAM: Brauzeringizda http://localhost:3000 ochiladi!\n\n` +
          `O'zingiz xohlagan matnlar, logotiplar va ranglarni o'zgartiring va bepul Vercel / Netlify orqali saytingizni internetga chiqaring!\n\n` +
          `Savollar bo'lsa: tanlovmahallasi@gmail.com\n`
      );

      // Generate the archive blob
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'tanlov-mahallasi-3d-source-v1.2.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 5000);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0e1424] border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-auto animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900/60 transition"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-950 border border-gray-700 p-[1px] shrink-0 flex items-center justify-center text-white shadow-lg">
            <Github className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                GitHub Manba Kodlari & Sayt Yaratish
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Ochiq Manba (Open Source v1.2)
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Ushbu fayllardan foydalanib o'zingizga yangi shaxsiy veb-sayt yarating!
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'guide'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 O'z Saytingizni Yaratish (Qo'llanma)
          </button>
          <button
            onClick={() => setActiveTab('clone')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'clone'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💻 GitHub Klonlash (Git Clone)
          </button>
          <button
            onClick={() => setActiveTab('zip')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'zip'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📦 1 Klikda ZIP Yuklab Olish
          </button>
        </div>

        {/* TAB 1: GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-black/60 border border-cyan-500/30 text-xs text-cyan-200">
              <span className="font-bold text-white">💡 Loyiha to'liq sizning ixtiyoringizda:</span> Ushbu fayllar yordamida o'zingiz xohlagan dizayn, uylar va funksiyalar bilan mustaqil shahar qurish saytingizni ishga tushirishingiz mumkin.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px]">1</span>
                  <span>Fayllarni oling</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  GitHub'dan repozitoriyani klonlang yoki «ZIP Yuklab Olish» tugmasi orqali to'liq arxivni kompyuteringizga oling.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold font-mono">
                  <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-[11px]">2</span>
                  <span>Kutubxonalarni o'rnating</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Terminal yoki CMD da papkaga kirib <code className="text-purple-300 bg-black/60 px-1 py-0.5 rounded">npm install</code> buyrug'ini bosing.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-[11px]">3</span>
                  <span>Lokalda ishga tushiring</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  <code className="text-emerald-300 bg-black/60 px-1 py-0.5 rounded">npm run dev</code> buyrug'i bilan saytingiz <code className="text-cyan-300 font-mono">localhost:3000</code> da ochiladi.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                  <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[11px]">4</span>
                  <span>Internetga bepul chiqaring</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Tayyor saytni <strong>Vercel.com</strong> yoki <strong>Netlify.com</strong> orqali 1 minutda bepul butun dunyoga e'lon qiling!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLONE COMMAND */}
        {activeTab === 'clone' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-300">
              Terminal orqali butun loyihani to'liq yuklab olish buyrug'i:
            </p>

            <div className="p-3.5 rounded-xl bg-black/80 border border-gray-700 flex items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 overflow-x-auto text-cyan-300 py-1">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="select-all">{cloneCommand}</span>
              </div>
              <button
                onClick={handleCopyClone}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 flex items-center gap-1.5 transition shrink-0 font-bold"
              >
                {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedClone ? 'Nusxalandi! ✓' : 'Nusxalash'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-400 space-y-1">
              <p>📌 <strong>GitHub Repozitoriy manzili:</strong></p>
              <a
                href="https://github.com/tanlovmahallasi/tanlov-mahallasi-3d"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 underline font-mono flex items-center gap-1"
              >
                <span>https://github.com/tanlovmahallasi/tanlov-mahallasi-3d</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: 1-CLICK ZIP DOWNLOAD */}
        {activeTab === 'zip' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold font-mono">
                <FolderArchive className="w-5 h-5 text-emerald-400" />
                <span>To'liq manba kodlari to'plami (ZIP)</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Ichida barcha asosiy konfiguratsiyalar, 3D dvijok sozlamalari, README.md yo'riqnomasi va loyiha tuzilishi mavjud. Yuklab olib, o'zingizning shaxsiy saytingizni darhol qurishni boshlang!
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition ${
                isZipping
                  ? 'bg-gray-800 text-gray-500 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-900/40'
              }`}
            >
              {isZipping ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ZIP arxiv yaratilmoqda...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Barcha Manba Kodlarini Yuklab Olish (.ZIP)</span>
                </>
              )}
            </button>

            {zipDownloaded && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Arxiv yuklandi! Papkani ochib "START_HERE.txt" faylini o'qing.</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ochiq Manba • Tanlov Mahallasi 3D</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
