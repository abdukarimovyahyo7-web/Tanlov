import React, { useState } from 'react';
import { Sparkles, Maximize2, Building, Eye, Camera } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  floors: string;
  gradient: string;
  accent: string;
  highlights: string[];
}

export const GallerySection: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'Tungi Kiber Metropoliya',
      category: '100 Qavatli Bino',
      description: "Neon nurlar, moviy lazer signallari va bulutlarni teshib o'tuvchi ulug'vor osmono'par minora.",
      floors: '100 Qavat',
      gradient: 'from-cyan-900/60 via-purple-900/40 to-blue-950/80',
      accent: '#00f0ff',
      highlights: ['Kiber Lazer Spire', 'Avtomatlashtirilgan Kiber Yo\'llar', 'Hokim Rezidensiyasi'],
    },
    {
      id: '2',
      title: 'Quyosh Botishi va Biznes Kvartali',
      category: 'Biznes Markazi',
      description: "Tillarang quyosh botishi shulasi ostida zamonaviy savdo markazlari va moliyaviy klasterlar.",
      floors: '20 Qavat',
      gradient: 'from-amber-900/60 via-orange-950/50 to-purple-950/80',
      accent: '#ffb703',
      highlights: ['Tillarang Shisha Fasad', 'Kiber-Kafe va Kovorking', 'Dinamik Soliq Markazi'],
    },
    {
      id: '3',
      title: 'Smart Eko-Mahalla & Favvoralar',
      category: 'Turar-joy Hududi',
      description: "Zumrad daraxtlar bilan o'ralgan futuristik uylar va aholi uchun interaktiv neon suv favvoralari.",
      floors: 'Oddiy Uy',
      gradient: 'from-emerald-950/70 via-teal-950/50 to-cyan-950/80',
      accent: '#10b981',
      highlights: ['Instagram Fuqarolar Ko\'chasi', 'Smart Eko Energetika', 'Baxt Indeksi 99%'],
    },
    {
      id: '4',
      title: 'Kengaytirilgan Sektor 14x14',
      category: 'Usta Rustam Infratuzilmasi',
      description: "Aholi soni 500 dan oshganda Usta Rustam tomonidan kengaytirilgan to'liq magistral yo'llar va hudud.",
      floors: 'Kengaytirilgan',
      gradient: 'from-blue-950/70 via-indigo-950/50 to-purple-950/80',
      accent: '#818cf8',
      highlights: ['Tezkor Kiber Magistral', 'Magnitli Monorels', 'Bosh Nazorat Minoralari'],
    },
  ];

  return (
    <section id="gallery" className="py-20 relative bg-[#070913]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase mb-3">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>O'yin Galereyasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Shahar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Manzaralari</span>
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base">
            Tanlov Mahallasi o'yinidagi 3D grafikalar, neon fasadlar va turli qavatdagi binolar ko'rinishi.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                sound.playClick();
                setSelectedItem(item);
              }}
              className="group rounded-2xl bg-[#0b0f1a] border border-gray-800 hover:border-cyan-400/60 overflow-hidden shadow-lg transition duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Graphic Placeholder Preview Box */}
              <div
                className={`h-48 relative overflow-hidden bg-gradient-to-br ${item.gradient} p-4 flex flex-col justify-between border-b border-gray-800`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase backdrop-blur-md border"
                    style={{ borderColor: `${item.accent}60`, color: item.accent, backgroundColor: `${item.accent}15` }}
                  >
                    {item.floors}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Cyber isometric illustration elements */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="w-20 h-20 rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center relative shadow-2xl group-hover:-translate-y-1 transition-transform">
                    <Building className="w-10 h-10" style={{ color: item.accent }} />
                    <div
                      className="absolute -bottom-1 w-12 h-1 rounded-full blur-xs"
                      style={{ backgroundColor: item.accent }}
                    />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-gray-300 backdrop-blur-md bg-black/40 px-2 py-1 rounded flex justify-between">
                  <span>{item.category}</span>
                  <span style={{ color: item.accent }}>3D HD</span>
                </div>
              </div>

              {/* Card info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base font-['Space_Grotesk'] mb-1 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <span>Tafsilotlarni ko'rish</span>
                  <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal View */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0e1322] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900/60"
              >
                ✕
              </button>

              <div
                className={`h-56 rounded-xl bg-gradient-to-br ${selectedItem.gradient} border border-cyan-500/40 p-6 flex flex-col items-center justify-center relative mb-5 shadow-2xl`}
              >
                <Building className="w-16 h-16 mb-2" style={{ color: selectedItem.accent }} />
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-black/60 border text-white" style={{ borderColor: selectedItem.accent }}>
                  {selectedItem.floors} • 3D Render
                </span>
              </div>

              <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-1">{selectedItem.title}</h3>
              <p className="text-xs text-cyan-400 font-mono mb-3">{selectedItem.category}</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{selectedItem.description}</p>

              <div className="mb-6 space-y-1.5">
                <span className="text-xs font-mono text-gray-400 uppercase">Asosiy Xususiyatlar:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.highlights.map((h, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 font-medium">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
              >
                Yopish
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
