import React, { useState, useEffect, useRef } from "react";
import { 
  Send, RefreshCw, Mic, MicOff, Volume2, VolumeX, Sparkles, 
  Terminal, Shield, Compass, Clock, RefreshCw as SpinIcon 
} from "lucide-react";
import { ChatMessage } from "../types";

interface AIChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  isProcessing: boolean;
}

export default function AIChatView({ 
  messages, onSendMessage, onClearHistory, isProcessing 
}: AIChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [speakingEnabled, setSpeakingEnabled] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Read latest model message aloud if speaking is enabled
  useEffect(() => {
    if (messages.length > 0 && speakingEnabled) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "model") {
        speakAloud(lastMsg.text);
      }
    }
  }, [messages, speakingEnabled]);

  // Web Speech STT Recognition Setup
  const toggleVoiceDictation = () => {
    if (voiceActive) {
      recognitionRef.current?.stop();
      setVoiceActive(false);
    } else {
      const SpeechReg = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechReg) {
        alert("Web Speech Recording API is not supported in this browser version. Try using Chrome or Edge.");
        return;
      }

      const rec = new SpeechReg();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => setVoiceActive(true);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText(prev => prev ? prev + " " + text : text);
      };
      rec.onerror = () => setVoiceActive(false);
      rec.onend = () => setVoiceActive(false);

      recognitionRef.current = rec;
      rec.start();
    }
  };

  // Speaks response out loud via Web Speech API
  const speakAloud = (textToSpeak: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Clean text of markdown before speech
    const cleanText = textToSpeak
      .replace(/[#*`_~]/g, '') // remove markdown indicators
      .slice(0, 150); // limit spoken feedback to avoid annoyance

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Select supportive female/neutral voice if available
    const voices = window.speechSynthesis.getVoices();
    const optimalVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google") || v.name.includes("Natural"));
    if (optimalVoice) utterance.voice = optimalVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const text = inputText;
    setInputText("");
    await onSendMessage(text);
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear your cockpit chat history?")) {
      await onClearHistory();
    }
  };

  // Helper to resolve icon of currently active speaking agent
  const getActiveAgentIcon = (context?: string) => {
    const ctx = context || "";
    if (ctx.includes("Planner")) return <Compass className="w-4 h-4 text-emerald-400" />;
    if (ctx.includes("Priority")) return <Shield className="w-4 h-4 text-rose-400" />;
    if (ctx.includes("Scheduler")) return <Clock className="w-4 h-4 text-amber-400" />;
    return <Sparkles className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="h-[calc(100vh-12rem)] min-h-[500px] flex flex-col bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl hover:border-indigo-500/10 transition-all duration-300">
      
      {/* CHAT HEADER */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#12151C]/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
          <div>
            <h3 className="font-bold text-sm text-slate-200 font-sans leading-none">Flight Control Assistant</h3>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">PROACTIVE MULTI-AGENT SYNAPSE ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSpeakingEnabled(!speakingEnabled)}
            className={`p-2 rounded-lg border ${speakingEnabled ? 'bg-indigo-950/40 border-indigo-900/50 text-indigo-400' : 'bg-[#12151C] border-white/5 text-slate-500'} hover:border-white/10 transition-all cursor-pointer`}
            title={speakingEnabled ? "Mute speech synthesis" : "Enable speech synthesis"}
          >
            {speakingEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={handleClear}
            className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Reset Console
          </button>
        </div>
      </div>

      {/* MESSAGES TIMELINE */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/5 bg-[#050608]/40">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${isUser ? 'ml-auto' : 'mr-auto'}`}
            >
              {/* Agent context badge */}
              {!isUser && msg.agentContext && (
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400 px-2.5 py-0.5 rounded bg-[#12151C] border border-white/5 mb-1">
                  {getActiveAgentIcon(msg.agentContext)}
                  <span>{msg.agentContext}</span>
                </div>
              )}

              {/* Message Bubble */}
              <div 
                className={`p-4 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed border ${
                  isUser 
                    ? 'bg-indigo-600 border-indigo-700/50 text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                    : 'bg-[#12151C]/80 border-white/5 text-slate-100 rounded-tl-none shadow-xl'
                }`}
              >
                {/* Text paragraph parser or simple pre-wrap markdown */}
                <div className="whitespace-pre-wrap font-sans font-medium space-y-2">
                  {msg.text}
                </div>
              </div>

              {/* Suggested quick clicks inside latest bot message */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.suggestedActions.map((act, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(act.label)}
                      className="px-2.5 py-1 rounded bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-900/50 text-[10px] font-mono font-bold text-indigo-400 transition-colors cursor-pointer"
                    >
                      {act.label} &rarr;
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* PROCESSING LOADER STATE */}
        {isProcessing && (
          <div className="flex flex-col items-start space-y-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/50">
              <SpinIcon className="w-3 h-3 animate-spin text-indigo-400" />
              <span>Coordinating agent synapses...</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#12151C]/40 border border-white/5 text-slate-400 rounded-tl-none text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <span>Thinking of appropriate scheduling allocations...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* FOOTER CONTROLS / INPUT BAR */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#0B0D11]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          {/* Dictation triggers */}
          <button
            type="button"
            onClick={toggleVoiceDictation}
            className={`p-3.5 rounded-xl border ${voiceActive ? 'bg-rose-950 border-rose-900 text-rose-400 animate-pulse' : 'bg-[#12151C] border-white/5 text-slate-400 hover:text-slate-200'} transition-all cursor-pointer`}
            title={voiceActive ? "Listening... click to stop" : "Speak to Pilot Assistant"}
          >
            {voiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950/80 border border-white/5 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 placeholder-slate-600 transition-all font-sans"
            placeholder={isProcessing ? "Awaiting agent synapses..." : "Ask: 'Schedule my focus slots today' or 'Break my chemistry report into tasks'"}
          />

          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-all shadow-md shadow-indigo-900/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
