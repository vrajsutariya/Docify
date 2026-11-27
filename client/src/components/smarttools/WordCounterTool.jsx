import React, { useState, useMemo } from 'react';
import { FileText, Clock, Volume2, AlignLeft, Hash, Copy, Check, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

export const WordCounterTool = () => {
  const [text, setText] = useState(
    'Docify is an all-in-one AI Document Intelligence and Productivity Suite. It empowers researchers, enterprise teams, and students to process complex technical documentation, financial datasets, and research papers with precision.\n\nWith 31+ specialized SmartTools, Docify enables high-speed PDF manipulation, bi-directional table conversions, and multilingual OCR recognition across English, Gujarati, and Hindi.'
  );
  const [copied, setCopied] = useState(false);

  // Real-time metrics
  const stats = useMemo(() => {
    const raw = text || '';
    const trimmed = raw.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = raw.length;
    const charactersNoSpaces = raw.replace(/\s/g, '').length;
    const sentences = trimmed ? trimmed.split(/[.?!]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;

    // Average reading speed: 200 words per minute
    const readingTimeMinutes = Math.ceil(words / 200);
    // Average speaking speed: 130 words per minute
    const speakingTimeMinutes = Math.ceil(words / 130);

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
    };
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
          <p className="text-[10px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider">
            Words
          </p>
          <p className="text-xl font-heading font-extrabold text-accent-dark dark:text-accent-light mt-0.5">
            {stats.words.toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
          <p className="text-[10px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider">
            Characters
          </p>
          <p className="text-xl font-heading font-extrabold text-light-heading dark:text-dark-heading mt-0.5">
            {stats.characters.toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
          <p className="text-[10px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider">
            No Spaces
          </p>
          <p className="text-xl font-heading font-extrabold text-light-heading dark:text-dark-heading mt-0.5">
            {stats.charactersNoSpaces.toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
          <p className="text-[10px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider">
            Sentences
          </p>
          <p className="text-xl font-heading font-extrabold text-light-heading dark:text-dark-heading mt-0.5">
            {stats.sentences}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
          <p className="text-[10px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider">
            Paragraphs
          </p>
          <p className="text-xl font-heading font-extrabold text-light-heading dark:text-dark-heading mt-0.5">
            {stats.paragraphs}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
          <p className="text-[10px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Read Time
          </p>
          <p className="text-xl font-heading font-extrabold text-light-heading dark:text-dark-heading mt-0.5">
            ~{stats.readingTimeMinutes}m
          </p>
        </div>

        <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-center">
          <p className="text-[10px] font-semibold text-light-body dark:text-dark-body uppercase tracking-wider flex items-center justify-center gap-1">
            <Volume2 className="w-3 h-3" /> Speech
          </p>
          <p className="text-xl font-heading font-extrabold text-light-heading dark:text-dark-heading mt-0.5">
            ~{stats.speakingTimeMinutes}m
          </p>
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-light-heading dark:text-dark-heading">
            Live Text Editor & Analytics
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-light-body dark:text-dark-body hover:text-accent-dark dark:hover:text-accent-light flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              className="text-xs text-status-danger hover:underline flex items-center gap-1 ml-2"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        <textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your document content here for instant real-time text analytics..."
          className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed font-sans"
        />
      </div>
    </div>
  );
};

export default WordCounterTool;
