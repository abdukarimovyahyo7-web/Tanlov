import React, { useState } from 'react';
import {
  Vote,
  Crown,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Instagram,
  MapPin,
  Search,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  X,
  Plus,
  Send,
  Flag,
  Landmark,
  UserCheck,
} from 'lucide-react';
import {
  Candidate,
  DistrictElectionState,
  getHokimElectionCountdown,
  getYordamchiElectionCountdown,
} from '../types/election.ts';
import { UZBEKISTAN_REGIONS, DistrictInfo, findDistrictById } from '../data/uzbekistanRegions.ts';
import { sound } from '../utils/audio.ts';

interface UzbekistanElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  playerInstagram: string;
  onUpdatePlayerInstagram: (nick: string) => void;
  isPrezident: boolean;
  onTogglePrezident: (value: boolean) => void;
  electionState: DistrictElectionState;
  onVote: (candidateId: string, role: 'hokim' | 'yordamchi') => void;
  onRegisterCandidate: (newCandidate: Omit<Candidate, 'id' | 'votes'>) => void;
  onPresidentialDecree: (decreeTitle: string, decreeType: string) => void;
}

export const UzbekistanElectionModal: React.FC<UzbekistanElectionModalProps> = ({
  isOpen,
  onClose,
  currentDistrictId,
  onSelectDistrict,
  playerInstagram,
  onUpdatePlayerInstagram,
  isPrezident,
  onTogglePrezident,
  electionState,
  onVote,
  onRegisterCandidate,
  onPresidentialDecree,
}) => {
  const [activeTab, setActiveTab] = useState<'hokim' | 'yordamchi' | 'president' | 'regions'>('hokim');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  // Candidate Registration form state
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
  const [registerRole, setRegisterRole] = useState<'hokim' | 'yordamchi'>('hokim');
  const [regName, setRegName] = useState<string>('');
  const [regInstagram, setRegInstagram] = useState<string>(playerInstagram || '');
  const [regProgram, setRegProgram] = useState<string>('');

  // Instagram Nick input bar in header
  const [tempNickInput, setTempNickInput] = useState<string>(playerInstagram || '');

  if (!isOpen) return null;

  const currentDistrict = findDistrictById(currentDistrictId);
  const currentRegion = UZBEKISTAN_REGIONS.find(r => r.id === currentDistrict?.regionId);

  // Countdown calculations
  const hokimCountdown = getHokimElectionCountdown(electionState.hokimCycleStart);
  const yordamchiCountdown = getYordamchiElectionCountdown(electionState.yordamchiCycleStart);

  // Check if player has voted
  const normalizedPlayerNick = (playerInstagram || '').trim().toLowerCase();
  const hasPlayerVoted = Boolean(
    normalizedPlayerNick &&
      electionState.votedInstagrams.some(v => v.trim().toLowerCase() === normalizedPlayerNick)
  );

  const handleSaveNick = () => {
    sound.playClick();
    let nick = tempNickInput.trim();
    if (nick && !nick.startsWith('@')) nick = '@' + nick;
    onUpdatePlayerInstagram(nick);
  };

  const handleSubmitCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regProgram.trim()) {
      alert("Iltimos, ism va saylov dasturingizni to'liq kiriting!");
      return;
    }
    sound.playExpansion();
    let nick = (regInstagram || playerInstagram || '@nomzod').trim();
    if (!nick.startsWith('@')) nick = '@' + nick;

    onRegisterCandidate({
      name: regName.trim(),
      instagram: nick,
      role: registerRole,
      districtId: currentDistrictId,
      program: regProgram.trim(),
      avatarColor: registerRole === 'hokim' ? '#00f0ff' : '#a855f7',
    });

    setRegName('');
    setRegProgram('');
    setShowRegisterForm(false);
  };

  // Filtered districts list for the Google Maps switcher
  const filteredDistricts = UZBEKISTAN_REGIONS.flatMap(region =>
    region.districts
      .filter(d => {
        const matchesSearch =
          d.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
          region.name.toLowerCase().includes(searchDistrict.toLowerCase());
        const matchesRegion = selectedRegionFilter === 'all' || region.id === selectedRegionFilter;
        return matchesSearch && matchesRegion;
      })
      .map(d => ({ ...d, regionName: region.name }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#090d1a] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden font-['Plus_Jakarta_Sans']">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-950 via-[#0c1224] to-gray-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-500 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                <Landmark className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Chakra_Petch'] tracking-wide">
                  O'ZBEKISTON SAYLOV MARKAZI
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                  v1.2 Ochiq Saylov
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-white font-medium">
                  {currentRegion?.name || 'Toshkent shahri'}:
                </span>
                <span className="text-cyan-300 font-bold">{currentDistrict?.name || 'Chilonzor tumani'}</span>
                <span className="text-[10px] text-gray-500 font-mono">(Google Maps)</span>
              </p>
            </div>
          </div>

          {/* Quick Instagram User Nick Login & President Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl px-2.5 py-1 text-xs">
              <Instagram className="w-3.5 h-3.5 text-pink-400 mr-1.5" />
              <input
                type="text"
                placeholder="@instagram_nik"
                value={tempNickInput}
                onChange={e => setTempNickInput(e.target.value)}
                onBlur={handleSaveNick}
                onKeyDown={e => e.key === 'Enter' && handleSaveNick()}
                className="bg-transparent border-none outline-none text-white text-xs w-28 sm:w-36 font-mono placeholder:text-gray-500"
              />
              <button
                onClick={handleSaveNick}
                className="text-[10px] bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 font-bold px-2 py-0.5 rounded ml-1 transition"
              >
                Saqlash
              </button>
            </div>

            {/* Supreme President Role Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                onTogglePrezident(!isPrezident);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition ${
                isPrezident
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-amber-500/50'
              }`}
              title="Prezidentlik vakolatini faollashtirish"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{isPrezident ? '👑 PREZIDENT (Siz)' : 'Prezident bo‘lish'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center border-b border-gray-800 bg-gray-950/60 px-4 gap-1 sm:gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('hokim');
            }}
            className={`px-3.5 py-3 border-b-2 font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'hokim'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Crown className="w-4 h-4 text-cyan-400" />
            <span>Hokim Saylovi (Oylik - 30 kun)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('yordamchi');
            }}
            className={`px-3.5 py-3 border-b-2 font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'yordamchi'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Hokim Yordamchisi (15 kunlik • 16-kuni yangi saylov!)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('president');
            }}
            className={`px-3.5 py-3 border-b-2 font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'president'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Flag className="w-4 h-4 text-amber-400" />
            <span>Prezident Kabineti (Oliy Rahbar)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('regions');
            }}
            className={`px-3.5 py-3 border-b-2 font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'regions'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>O'zbekiston Shahar & Tumanlari (Google Maps)</span>
          </button>
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ==================================================== */}
          {/* TAB 1: HOKIM SAYLOVI (OYLIK - 30 KUNLIK MUDDAT)       */}
          {/* ==================================================== */}
          {activeTab === 'hokim' && (
            <div className="space-y-6 animate-fadeIn">
              {/* CURRENT ELECTED HOKIM BANNER */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-[#0e1628] to-gray-950 border border-cyan-500/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xl shadow-lg shadow-cyan-500/30">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500 text-black font-extrabold">
                          Hozirgi Saylangan Hokim
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {currentDistrict?.name}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {electionState.hokim.name}
                      </h3>
                      <p className="text-xs font-mono text-pink-400 font-semibold flex items-center gap-1">
                        <Instagram className="w-3.5 h-3.5" />
                        <span>{electionState.hokim.instagram}</span>
                        <span className="text-gray-400 ml-2">
                          • {electionState.hokim.votes} ta saylovchi ovozi
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* 30-Day Monthly Countdown Card */}
                  <div className="p-3.5 rounded-xl bg-gray-950/80 border border-cyan-500/30 font-mono text-center min-w-[200px]">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>Oylik Saylov Muddati</span>
                    </div>
                    <div className="text-xl font-bold text-cyan-300 mt-0.5">
                      {hokimCountdown.daysLeft} kun {hokimCountdown.hoursLeft} soat
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${hokimCountdown.percentElapsed}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Har oy yangi saylov o'tkaziladi</p>
                  </div>
                </div>
              </div>

              {/* ACTION ROW: REGISTER & INFO */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-950/50 p-3.5 rounded-xl border border-gray-800">
                <div className="text-xs text-gray-300">
                  <span className="font-bold text-cyan-400">Har oy saylov bo'ladi:</span> Kim eng ko'p ovoz olsa, shu shahar/tuman hokimi bo'ladi!
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setRegisterRole('hokim');
                    setShowRegisterForm(!showRegisterForm);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs font-mono hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hokimlikka Nomzod Bo'lish</span>
                </button>
              </div>

              {/* CANDIDATE REGISTRATION ACCORDION */}
              {showRegisterForm && (
                <form
                  onSubmit={handleSubmitCandidate}
                  className="p-4 rounded-xl bg-[#0d1424] border border-cyan-500/40 space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>{registerRole === 'hokim' ? 'Hokimlik' : 'Hokim Yordamchisi'} nomzodini ro'yxatdan o'tkazish</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowRegisterForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-400 font-mono block mb-1">
                        To'liq Ismingiz:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Jamshid Aliyev"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-mono block mb-1">
                        Instagram Nikingiz:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="@username"
                        value={regInstagram}
                        onChange={e => setRegInstagram(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-mono block mb-1">
                      Saylovoldi dasturingiz va va'dangiz:
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Masalan: Tumanimizda yangi 100 qavatli IT markazi va bog'lar barpo etaman!"
                      value={regProgram}
                      onChange={e => setRegProgram(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRegisterForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 font-mono"
                    >
                      Nomzodlikni Tasdiqlash
                    </button>
                  </div>
                </form>
              )}

              {/* LIVE HOKIM CANDIDATES LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-gray-400 flex items-center justify-between">
                  <span>Hokimlikka Ro'yxatdan O'tgan Nomzodlar ({electionState.hokimCandidates.length} ta)</span>
                  <span className="text-[11px] text-cyan-400 font-bold">Har bir Instagram egasi 1 marta ovoz berishi mumkin</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {electionState.hokimCandidates
                    .sort((a, b) => b.votes - a.votes)
                    .map((cand, idx) => {
                      const isLeader = idx === 0;
                      return (
                        <div
                          key={cand.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition relative ${
                            isLeader
                              ? 'bg-gradient-to-b from-[#0c1626] to-[#090e1c] border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                              : 'bg-gray-950/70 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          {isLeader && (
                            <div className="absolute -top-2.5 right-3 bg-amber-400 text-black font-bold text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <Crown className="w-3 h-3 fill-black" />
                              <span>YETAKCHI (1-o'rin)</span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2.5 mb-2">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black text-sm shrink-0 shadow"
                                style={{ backgroundColor: cand.avatarColor || '#00f0ff' }}
                              >
                                {cand.name.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                <h5 className="text-sm font-bold text-white truncate">
                                  {cand.name}
                                </h5>
                                <p className="text-[11px] font-mono text-pink-400 truncate">
                                  {cand.instagram}
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed mb-3 line-clamp-3 bg-gray-900/60 p-2.5 rounded-lg border border-gray-800">
                              «{cand.program}»
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-2 mt-auto">
                            <div>
                              <span className="text-[10px] text-gray-400 font-mono block">Jami ovoz:</span>
                              <span className="text-base font-bold text-cyan-300 font-mono">
                                {cand.votes}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                sound.playClick();
                                onVote(cand.id, 'hokim');
                              }}
                              disabled={hasPlayerVoted}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 ${
                                hasPlayerVoted
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-md'
                              }`}
                            >
                              <Vote className="w-3.5 h-3.5" />
                              <span>{hasPlayerVoted ? 'Ovoz berildi' : 'Ovoz berish'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: HOKIM YORDAMCHISI (15 KUNLIK MUDDAT, 16-KUNI)   */}
          {/* ==================================================== */}
          {activeTab === 'yordamchi' && (
            <div className="space-y-6 animate-fadeIn">
              {/* CURRENT HOKIM YORDAMCHISI CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#140e28] to-gray-950 border border-purple-500/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-300 font-bold text-xl shadow-lg shadow-purple-500/30">
                      🤝
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500 text-white font-extrabold">
                          Hozirgi Hokim Yordamchisi
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {currentDistrict?.name}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {electionState.yordamchi.name}
                      </h3>
                      <p className="text-xs font-mono text-pink-400 font-semibold flex items-center gap-1">
                        <Instagram className="w-3.5 h-3.5" />
                        <span>{electionState.yordamchi.instagram}</span>
                        <span className="text-gray-400 ml-2">
                          • {electionState.yordamchi.votes} ta ovoz
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* 15-Day Term Countdown (16th Day Election Day!) */}
                  <div className="p-3.5 rounded-xl bg-gray-950/80 border border-purple-500/30 font-mono text-center min-w-[220px]">
                    <div className="text-[10px] text-purple-300 uppercase tracking-wider flex items-center justify-center gap-1 font-bold">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>15 Kunlik Muddat</span>
                    </div>

                    {yordamchiCountdown.isElectionDay ? (
                      <div className="text-sm font-extrabold text-amber-300 bg-amber-500/20 border border-amber-400/40 rounded px-2 py-1 mt-1 animate-pulse">
                        🎉 BUGUN 16-KUN: YANGI SAYLOV KUNI!
                      </div>
                    ) : (
                      <>
                        <div className="text-xl font-bold text-purple-300 mt-0.5">
                          {yordamchiCountdown.daysLeft} kun {yordamchiCountdown.hoursLeft} soat
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-purple-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${yordamchiCountdown.percentElapsed}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Davrning {yordamchiCountdown.dayInCycle}-kuni • 16-kuni yangi saylov!
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SPECIAL RULE EXPLANATION */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 text-purple-200">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    <strong>Qoida:</strong> Hokim yordamchisi hokim emas, aynan hokim yordamchisi lavozimi uchun alohida saylanadi. Muddat 15 kun, 16-kuni darhol yangi saylov bo'lib o'tadi!
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setRegisterRole('yordamchi');
                    setShowRegisterForm(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-500 text-white font-bold text-xs font-mono hover:bg-purple-400 transition"
                >
                  Yordamchilikka Nomzod Bo'lish
                </button>
              </div>

              {/* YORDAMCHI CANDIDATES LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-gray-400">
                  Hokim Yordamchisiga Nomzodlar ({electionState.yordamchiCandidates.length} ta)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {electionState.yordamchiCandidates
                    .sort((a, b) => b.votes - a.votes)
                    .map((cand, idx) => (
                      <div
                        key={cand.id}
                        className="p-4 rounded-xl border border-gray-800 bg-gray-950/70 flex flex-col justify-between hover:border-purple-500/40 transition"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                              style={{ backgroundColor: cand.avatarColor || '#a855f7' }}
                            >
                              {cand.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-white">{cand.name}</h5>
                              <p className="text-[11px] font-mono text-pink-400">{cand.instagram}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 bg-gray-900/60 p-2.5 rounded-lg border border-gray-800 mb-3">
                            «{cand.program}»
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 font-mono block">Ovozlar:</span>
                            <span className="text-base font-bold text-purple-300 font-mono">
                              {cand.votes} ta ovoz
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              sound.playClick();
                              onVote(cand.id, 'yordamchi');
                            }}
                            disabled={hasPlayerVoted}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 ${
                              hasPlayerVoted
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-500 text-white hover:bg-purple-400'
                            }`}
                          >
                            <Vote className="w-3.5 h-3.5" />
                            <span>{hasPlayerVoted ? 'Ovoz berildi' : 'Ovoz berish'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PREZIDENT KABINETI (SUPREME PRESIDENT DEVONI)   */}
          {/* ==================================================== */}
          {activeTab === 'president' && (
            <div className="space-y-6 animate-fadeIn">
              {/* PRESIDENTIAL SEAL & STATUS BANNER */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#1a1408] to-gray-950 border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-[2px] shadow-lg shadow-amber-500/40">
                      <div className="w-full h-full bg-[#120e06] rounded-[14px] flex items-center justify-center">
                        <Crown className="w-8 h-8 text-amber-300 fill-amber-400" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold">
                        Oliy Davlat Hokimiyati
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 font-['Chakra_Petch']">
                        O'ZBEKISTON RESPUBLIKASI PREZIDENTI
                      </h3>
                      <p className="text-xs text-amber-200/80 mt-0.5">
                        «Albatta men prezident boʻlaman. Mening o'yinim barcha odamlar uchun ochiq boʻladi. Oʻz Instagram nikini yozadi kirib oʻynay beradi.»
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-gray-400 block">Prezidentlik Maqomi:</span>
                    <span className="text-sm font-bold text-amber-300 font-mono">
                      {isPrezident ? '✅ MUTLAQ HUQUQLAR FAOL' : 'Oddiy Saylovchi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* PRESIDENTIAL DECREES (PREZIDENT FARMONLARI) */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Oliy Prezident Farmonlari (Imtiyoz va vakolatlar)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Decree 1: Subsidies */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-gray-950/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>💰 Davlat Byudjeti Dotatsiyasi</span>
                      </h5>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">+$500,000</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {currentDistrict?.name} shahar g'aznasiga to'g'ridan-to'g'ri yarim million dollar davlat dotatsiyasi ajratish.
                    </p>
                    <button
                      onClick={() => {
                        sound.playExpansion();
                        onPresidentialDecree(
                          `Prezident Farmoni: ${currentDistrict?.name} ga $500,000 davlat dotatsiyasi ajratildi!`,
                          'funds'
                        );
                      }}
                      className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition"
                    >
                      Farmonni Imzolash
                    </button>
                  </div>

                  {/* Decree 2: Yashil Makon */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-gray-950/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🌿 Umumxalq "Yashil Makon" Hashari</span>
                      </h5>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Baxt</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Butun hududda maysazorlar, favvoralar va daraxtzorlar ekish bo'yicha umumrespublika hashari e'lon qilish.
                    </p>
                    <button
                      onClick={() => {
                        sound.playExpansion();
                        onPresidentialDecree(
                          `Prezident Farmoni: "Yashil Makon" umumxalq hashari e'lon qilindi! Aholi kayfiyati 100%!`,
                          'holiday'
                        );
                      }}
                      className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition"
                    >
                      Hashar Farmonini Imzolash
                    </button>
                  </div>

                  {/* Decree 3: Early Election */}
                  <div className="p-4 rounded-xl border border-cyan-500/30 bg-gray-950/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🗳️ Favqulodda Yangi Saylov E'lon Qilish</span>
                      </h5>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">Tsiklni yangilash</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Tuman hokimi yoki hokim yordamchisi bo'yicha darhol yangi umumxalq ochiq saylovlarini boshlash.
                    </p>
                    <button
                      onClick={() => {
                        sound.playCash();
                        onPresidentialDecree(
                          `Prezident Farmoni: ${currentDistrict?.name}da muddatidan oldin favqulodda ochiq saylov e'lon qilindi!`,
                          'election'
                        );
                      }}
                      className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono transition"
                    >
                      Yangi Saylov Farmoni
                    </button>
                  </div>

                  {/* Decree 4: Soliq Ta'tili */}
                  <div className="p-4 rounded-xl border border-purple-500/30 bg-gray-950/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🛡️ Maxsus Iqtisodiy Imtiyoz & Soliq Ta'tili</span>
                      </h5>
                      <span className="text-[10px] font-mono text-purple-400 font-bold">2x Biznes</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Biznes binolari va kiber klasterlar uchun soliq stavkasini qisqartirish, fuqarolar oqimini oshirish.
                    </p>
                    <button
                      onClick={() => {
                        sound.playCash();
                        onPresidentialDecree(
                          `Prezident Farmoni: ${currentDistrict?.name}da erkin kiber iqtisodiy zona tashkil etildi!`,
                          'tax'
                        );
                      }}
                      className="w-full py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono transition"
                    >
                      Imtiyoz Farmonini Imzolash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: O'ZBEKISTON SHAHAR VA TUMANLARI (GOOGLE MAPS)  */}
          {/* ==================================================== */}
          {activeTab === 'regions' && (
            <div className="space-y-4 animate-fadeIn">
              {/* SEARCH & REGION FILTER */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Shahar yoki tuman nomini qidiring (Google Maps)..."
                    value={searchDistrict}
                    onChange={e => setSearchDistrict(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <select
                  value={selectedRegionFilter}
                  onChange={e => setSelectedRegionFilter(e.target.value)}
                  className="bg-gray-950 border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="all">Barcha Viloyatlar (14 ta hudud)</option>
                  {UZBEKISTAN_REGIONS.map(reg => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DISTRICT CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredDistricts.map(item => {
                  const isCurrent = item.id === currentDistrictId;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                          <span>{item.regionName}</span>
                          <span className="text-cyan-400">
                            ~{(item.populationEstimate / 1000).toFixed(0)}k aholi
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white mb-1">{item.name}</h5>
                        <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-800/80 mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-500">
                          {item.centerCoordinates[0].toFixed(2)}° N, {item.centerCoordinates[1].toFixed(2)}° E
                        </span>

                        <button
                          onClick={() => {
                            sound.playClick();
                            onSelectDistrict(item.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-cyan-400 text-black'
                              : 'bg-gray-800 text-gray-200 hover:bg-cyan-500 hover:text-black'
                          }`}
                        >
                          <span>{isCurrent ? 'Faol Hudud' : "O'tish"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>O'zbekiston Saylov Tizimi Ochiq va Shaffof</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
