import React, { useState } from 'react';
import { Mail, Send, Check, Copy, Instagram, X, MessageSquare } from 'lucide-react';
import { sound } from '../utils/audio.ts';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [instagramNick, setInstagramNick] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const targetEmail = 'tanlovmahallasi@gmail.com';

  const handleCopyEmail = () => {
    sound.playClick();
    navigator.clipboard.writeText(targetEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCash();

    // Prepare mailto link
    const subject = encodeURIComponent(`Tanlov Mahallasi - Murojaat: ${name || 'Fuqaro'}`);
    const body = encodeURIComponent(
      `Ism: ${name}\nEmail: ${userEmail}\nInstagram: ${instagramNick}\n\nXabar:\n${message}`
    );
    const mailtoUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    // Open default email client
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-900/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Hokimiyatga Murojaat
            </h3>
            <p className="text-xs text-gray-400">
              «Tanlov Mahallasi» ma'muriyatiga to'g'ridan-to'g'ri xabar yuboring
            </p>
          </div>
        </div>

        {/* Target Email Banner */}
        <div className="mb-5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-sm text-cyan-300 font-semibold">{targetEmail}</span>
          </div>
          <button
            onClick={handleCopyEmail}
            className="px-2.5 py-1 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 text-xs font-mono flex items-center gap-1 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
          </button>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Xabar Yuborildi!</h4>
            <p className="text-xs text-gray-300">
              Email ilovangiz orqali <strong>{targetEmail}</strong> manziliga xat yo'llandi. 
              Tez orada siz bilan bog'lanamiz!
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              Yopish
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                Ismingiz
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                  Emailingiz
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="nomingiz@mail.com"
                  className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-pink-300 uppercase mb-1 flex items-center gap-1">
                  <Instagram className="w-3 h-3 text-pink-400" />
                  Instagram Nikingiz
                </label>
                <input
                  type="text"
                  value={instagramNick}
                  onChange={(e) => setInstagramNick(e.target.value)}
                  placeholder="@foydalanuvchi"
                  className="w-full bg-black/60 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-1">
                Xabaringiz / Taklifingiz
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="O'yin haqida taklif, savol yoki uylar dizayni bo'yicha fikringiz..."
                rows={4}
                className="w-full bg-black/60 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Official Instagram link notice */}
            <div className="text-[11px] text-gray-400 flex items-center justify-between">
              <span>Biz faqat rasmiy Instagram orqali ishlaymiz:</span>
              <a
                href="https://instagram.com/tanlovmahallasi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 font-mono font-semibold flex items-center gap-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                @tanlovmahallasi
              </a>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Email Orqali Yuborish</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
