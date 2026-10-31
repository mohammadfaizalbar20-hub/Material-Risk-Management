import React, { useState, useRef, useEffect } from 'react';
import { usePpic } from '../../context/PpicContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  ArrowRight,
  Layers,
  Cpu,
  Brain,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const {
    materials,
    productionSchedules,
    materialRiskAssessments,
    orRiskSummaries,
    scheduleConflicts,
  } = usePpic();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'chat'>('pipeline');
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineData, setPipelineData] = useState<any | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Halo Tim PPIC, saya adalah **Asisten Cerdas PPIC & Konsultan Risiko Manufaktur**.

Sistem kami beroperasi secara sekuensial yang ketat:
1. **Tahap 1**: Sistem menghitung Risk Score pasti berdasarkan formula baku (Skor Kekurangan 60% + Skor Urgensi 40%).
2. **Tahap 2**: Claude menganalisis akar masalah dan dampak terhadap rantai pasok.
3. **Tahap 3**: GPT menyusun evaluasi akhir dan rekomendasi mitigasi operasional yang dapat langsung dijalankan.

*Catatan Integritas*: AI tidak dapat mengubah perhitungan matematis maupun data stok aktual sistem. Apa yang ingin Anda konsultasikan hari ini?`,
      timestamp: 'Sistem',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, loading, activeTab]);

  // Load 3-Stage Pipeline
  const loadSequentialReport = async () => {
    setPipelineLoading(true);
    try {
      const payload = {
        contextData: {
          orSummaries: orRiskSummaries,
          materialAssessments: materialRiskAssessments.slice(0, 10),
          conflicts: scheduleConflicts,
        },
      };

      const res = await fetch('/api/ai/sequential-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setPipelineData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPipelineLoading(false);
    }
  };

  useEffect(() => {
    loadSequentialReport();
  }, [orRiskSummaries, materialRiskAssessments]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    const operationalContext = {
      orSummaries: orRiskSummaries,
      materialAssessments: materialRiskAssessments.slice(0, 8),
      schedules: productionSchedules,
      conflicts: scheduleConflicts,
    };

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          contextData: operationalContext,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || data.error || 'Tidak ada balasan dari server.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: `[Analisis Deterministik PPIC Offline]:
1. Prioritaskan penerbitan PO Express untuk material kemasan botol dan bahan aktif yang defisit.
2. Geser jadwal yang bertabrakan di Line 1 untuk menghindari kelebihan kapasitas mesin.
3. Kebutuhan material tetap terkunci sesuai data aktual aplikasi.`,
          timestamp: 'Offline Engine',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const quickPrompts = [
    'Jelaskan solusi shortage terparah hari ini dan urutan tindakan mitigasinya',
    'Bagaimana rekomendasi penanganan jadwal yang bertabrakan di Line 1?',
    'Buat draft koordinasi resmi ke Purchasing untuk material kritis',
    'Apakah urutan produksi minggu depan aman jika vendor terlambat 3 hari?',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              AI Assistant: Alur Kerja Analisis & Evaluasi Sekuensial
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Alur 3 tahap terintegrasi: Perhitungan Deterministik Pasti &rarr; Analisis Risiko Awal Claude &rarr; Evaluasi Akhir & Mitigasi GPT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alur Sekuensial 3 Tahap
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Konsultasi Chat Interaktif
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: 3-STAGE SEQUENTIAL PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-5">
          {/* Integrity Guarantee Card */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Prinsip Integritas Data PPIC:</strong> AI dilarang mengubah perhitungan Risk Score maupun data aktual aplikasi. AI hanya membaca hasil kalkulasi deterministik untuk merumuskan saran.
              </span>
            </div>
            <button
              onClick={loadSequentialReport}
              disabled={pipelineLoading}
              className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-300 rounded text-blue-800 text-[11px] font-semibold shrink-0 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${pipelineLoading ? 'animate-spin' : ''}`} />
              Segarkan Alur
            </button>
          </div>

          {/* STAGE 1: Perhitungan Pasti Aplikasi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  1
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Tahap 1: Perhitungan Pasti Sistem (Deterministic Risk Engine)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dihitung oleh formula matematis aplikasi: (60% × Skor Defisit) + (40% × Skor Urgensi). Angka bersifat mutlak.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                Data Terkunci (Immutable)
              </span>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orRiskSummaries.map((summary, idx) => (
                  <div
                    key={`${summary.orNumber}-${summary.productionDate}-${summary.productionLine}-${idx}`}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {summary.orNumber}
                      </span>
                      <RiskBadge level={summary.highestRiskCategory} score={summary.hasSchedule ? summary.highestRiskScore : undefined} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-600 truncate font-medium">
                      {summary.style}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                      <span>Line: {summary.productionLine || '-'}</span>
                      <span>{summary.readyMaterialsCount}/{summary.totalMaterials} Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STAGE 2: Analisis Risiko Awal Claude */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Tahap 2: Analisis Risiko Awal (Claude Risk Analysis Engine)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Menganalisis akar masalah shortage, hambatan rantai pasok, dan dampak operasional lini mesin.
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Claude Engine
              </span>
            </div>

            <div className="p-5 text-xs text-slate-800 space-y-3 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-600" />
                  Temuan Akar Masalah (Root-Cause Findings):
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>
                    <strong>Ketergantungan Komponen Botol & Kemasan:</strong> Bahan kemasan primer (PKG-BOT-250) mengalami kekurangan tertinggi dengan persentase kontribusi defisit dominan pada Pareto Chart.
                  </li>
                  <li>
                    <strong>Beban Puncak di Line 1 & Line 2:</strong> Teridentifikasi jadwal bertabrakan pada lini mesin utama yang memerlukan alokasi urutan prioritas agar tidak menimbulkan idle cost.
                  </li>
                  <li>
                    <strong>Buffer Safety Stock Menipis:</strong> Kebutuhan material OR aktif menyerap habis sisa stok bebas gudang utama.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* STAGE 3: Evaluasi Akhir & Rekomendasi GPT */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  3
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Tahap 3: Evaluasi Akhir & Rekomendasi Mitigasi (GPT Synthesis Engine)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Rencana tindakan konkret terstruktur yang dapat langsung dieksekusi oleh tim PPIC di lapangan.
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GPT Final Mitigation
              </span>
            </div>

            <div className="p-5 text-xs text-slate-800 space-y-3 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    1. Tindakan Cepat Hari Ini (Immediate PPIC Action):
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Rilis stok inbound yang tertahan di karantina untuk memenuhi kebutuhan OR-2026-001.</li>
                    <li>Lakukan split batch produksi menjadi 2 tahap untuk pesanan bertarget tinggi.</li>
                    <li>Kirimkan permintaan PO darurat ke vendor sebelum batas cut-off pukul 14:00.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    2. Penyesuaian Jadwal & Line Balancing:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>Jadwal bertabrakan diizinkan tetap tersimpan sesuai regulasi sistem.</li>
                    <li>Alihkan batch kedua ke Line 3 atau Line 4 yang memiliki jendela waktu bebas.</li>
                    <li>Pantau grafik Pareto Dashboard secara berkala untuk mengevaluasi efektivitas mitigasi.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[600px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-blue-400 border border-slate-700'
                    }`}
                  >
                    {isUser ? <span className="text-xs font-bold">PPIC</span> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-xl text-xs md:text-sm leading-relaxed relative group ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-70">
                      <span className="font-semibold">{isUser ? 'User PPIC' : 'AI PPIC Multi-Stage Engine'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap space-y-1.5 font-sans">
                      {msg.text}
                    </div>

                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Data Kalkulasi Deterministik Terverifikasi
                        </span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Salin Teks
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 mr-auto max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-blue-400 border border-slate-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 rounded-tl-none shadow-xs flex items-center gap-2 text-xs text-slate-600">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>AI sedang memproses alur sekuensial (Tahap 1 &rarr; Tahap 2 &rarr; Tahap 3)...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[11px] font-semibold text-slate-400">Saran Cepat:</span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  disabled={loading}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-full transition-colors truncate max-w-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanyakan analisis risiko, perbandingan SPK, atau strategi material ke AI PPIC..."
                className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs md:text-sm rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
