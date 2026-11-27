import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Sparkles,
  Languages,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Send,
  AlertCircle,
  Tag,
  Upload,
  Download,
  X,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  quickAiSummary,
  quickAiTranslate,
  quickGrammar,
  quickTitleKeywords,
  downloadBlob,
} from '../../services/toolsService';

const POPULAR_LANGUAGES = [
  { id: 'hi', label: 'Hindi (हिन्दी)' },
  { id: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { id: 'en', label: 'English' },
  { id: 'mr', label: 'Marathi (मराठी)' },
  { id: 'ta', label: 'Tamil (தமிழ்)' },
  { id: 'te', label: 'Telugu (తెలుగు)' },
  { id: 'bn', label: 'Bengali (বাংলা)' },
  { id: 'es', label: 'Spanish (Español)' },
  { id: 'fr', label: 'French (Français)' },
  { id: 'de', label: 'German (Deutsch)' },
  { id: 'ar', label: 'Arabic (العربية)' },
  { id: 'ru', label: 'Russian' },
  { id: 'ja', label: 'Japanese' },
  { id: 'zh', label: 'Chinese' },
];

export const AiQuickTools = ({ initialTool = 'translate' }) => {
  const [activeTab, setActiveTab] = useState(initialTool === 'resume' ? 'translate' : initialTool);
  const [inputContent, setInputContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resultContent, setResultContent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Options
  const [summaryLength, setSummaryLength] = useState('medium');
  const [targetLang, setTargetLang] = useState('hi');
  const [customLang, setCustomLang] = useState('');
  const [isCustomLang, setIsCustomLang] = useState(false);
  const [grammarTone, setGrammarTone] = useState('formal');

  const tabs = [
    { id: 'translate', label: 'AI Translator', icon: Languages },
    { id: 'summary', label: 'AI Summarizer', icon: Sparkles },
    { id: 'grammar', label: 'Grammar & Tone', icon: CheckCircle2 },
    { id: 'keywords', label: 'Title & Keywords', icon: Tag },
  ];

  // Dropzone for Word, PDF, or Text files
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: false,
    onDrop: (accepted) => {
      if (accepted[0]) {
        const file = accepted[0];
        setUploadedFile(file);
        setError(null);
        setResultContent(null);

        // If it's a plain text file, we can also preview it immediately in the textarea
        if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setInputContent(e.target.result || '');
          };
          reader.readAsText(file);
        }
      }
    },
  });

  const handleRunAi = async () => {
    const hasText = inputContent.trim().length > 0;
    const hasFile = Boolean(uploadedFile);

    if (!hasText && !hasFile) {
      setError('Please provide text or upload a Word (.docx), PDF, or text file to process.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setResultContent(null);

      const effectiveTarget = isCustomLang && customLang.trim() ? customLang.trim() : targetLang;

      if (activeTab === 'translate') {
        const res = await quickAiTranslate({
          text: hasText ? inputContent : undefined,
          file: uploadedFile || undefined,
          targetLanguage: effectiveTarget,
        });
        const data = res?.data || res;
        setResultContent(data?.translatedText || 'Translation completed.');
      } else if (activeTab === 'summary') {
        const res = await quickAiSummary({
          text: hasText ? inputContent : undefined,
          file: uploadedFile || undefined,
          length: summaryLength,
        });
        const data = res?.data || res;
        setResultContent(data?.summary || 'Summary completed.');
      } else if (activeTab === 'grammar') {
        const res = await quickGrammar({ text: inputContent, tone: grammarTone });
        const data = res?.data || res;
        setResultContent(
          `Corrected Text:\n${data.correctedText || inputContent}\n\nKey Improvements:\n${(data.improvements || []).map((i) => `• ${i}`).join('\n')}`
        );
      } else if (activeTab === 'keywords') {
        const res = await quickTitleKeywords({ text: inputContent });
        const data = res?.data || res;
        setResultContent(
          `Suggested SEO Titles:\n${(data.titles || []).map((t, idx) => `${idx + 1}. ${t}`).join('\n')}\n\nCore Keywords:\n${(data.keywords || []).join(', ')}`
        );
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'AI request failed. Please check your document or connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!resultContent) return;
    navigator.clipboard.writeText(resultContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    if (!resultContent) return;
    const blob = new Blob([resultContent], { type: 'text/plain;charset=utf-8' });
    const name = uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, '') : 'docify-ai';
    downloadBlob(blob, `${name}-${activeTab}.txt`);
  };

  const downloadAsWord = () => {
    if (!resultContent) return;
    const title = activeTab === 'translate' ? 'Translated Document' : 'Docify AI Output';
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title></head>
      <body style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; margin: 40px;">
        <h2 style="color: #06B6D4;">Docify AI - ${title}</h2>
        <p style="color: #64748B; font-size: 9pt;">Generated via Docify High-Speed AI Engine</p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 15px 0 25px 0;" />
        <div style="white-space: pre-wrap;">${resultContent}</div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const name = uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, '') : 'docify-ai';
    downloadBlob(blob, `${name}-${activeTab}.doc`);
  };

  return (
    <div className="space-y-5">
      {/* 1. TAB SWITCHER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-light-border dark:border-dark-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setResultContent(null);
                setError(null);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 shrink-0 ${
                isActive
                  ? 'border-accent text-accent-dark dark:text-accent-light bg-accent/5 font-bold'
                  : 'border-transparent text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. PARAMETERS & LANGUAGE CONTROLS */}
      <div className="p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-3">
        {activeTab === 'translate' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-light-heading dark:text-dark-heading flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                Target Language Selection
              </span>
              <button
                type="button"
                onClick={() => setIsCustomLang(!isCustomLang)}
                className="text-[11px] text-accent-dark dark:text-accent-light font-semibold hover:underline"
              >
                {isCustomLang ? 'Select from list' : '+ Custom Language'}
              </button>
            </div>

            {isCustomLang ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customLang}
                  onChange={(e) => setCustomLang(e.target.value)}
                  placeholder="Type any language (e.g. Sanskrit, Punjabi, Italian, Japanese...)"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {POPULAR_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setTargetLang(lang.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      targetLang === lang.id
                        ? 'bg-accent text-black font-bold shadow-sm scale-105'
                        : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body hover:border-accent border border-transparent'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-light-heading dark:text-dark-heading">Summary Depth:</span>
            {['short', 'medium', 'long'].map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setSummaryLength(len)}
                className={`px-3 py-1 rounded-lg capitalize text-xs transition-all ${
                  summaryLength === len
                    ? 'bg-accent text-black font-bold shadow-sm'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'grammar' && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-light-heading dark:text-dark-heading">Paraphrase Tone:</span>
            {['formal', 'academic', 'concise', 'casual'].map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setGrammarTone(tone)}
                className={`px-3 py-1 rounded-lg capitalize text-xs transition-all ${
                  grammarTone === tone
                    ? 'bg-accent text-black font-bold shadow-sm'
                    : 'bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'keywords' && (
          <span className="text-light-body dark:text-dark-body text-xs">
            Docify AI automatically extracts SEO titles, search hashtags, and core metadata frequency keywords.
          </span>
        )}
      </div>

      {/* 3. FILE UPLOAD DROPZONE (FOR TRANSLATOR & SUMMARIZER) */}
      {(activeTab === 'translate' || activeTab === 'summary') && (
        <div className="space-y-2">
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-accent bg-accent/5'
                  : 'border-light-border dark:border-dark-border hover:border-accent hover:bg-light-surface/60 dark:hover:bg-dark-surface/60'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-2 text-xs text-light-heading dark:text-dark-heading font-semibold">
                <Upload className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                <span>Upload Word (.docx / .doc), PDF (.pdf), or Text file</span>
              </div>
              <p className="text-[11px] text-light-body dark:text-dark-body mt-0.5">
                Drag and drop your document here, or type/paste text directly below.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-accent-dark dark:text-accent-light" />
                <div>
                  <p className="text-xs font-bold text-light-heading dark:text-dark-heading truncate max-w-[260px]">
                    {uploadedFile.name}
                  </p>
                  <p className="text-[10px] text-light-body dark:text-dark-body">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Document Attached
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadedFile(null);
                  setInputContent('');
                }}
                className="p-1 rounded-lg text-light-body hover:text-rose-500 transition-colors"
                title="Remove attached file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. INPUT / OUTPUT WORKSPACE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
              {uploadedFile ? 'Or Edit Extracted Content' : 'Input Text to Process'}
            </label>
            {inputContent && (
              <button
                type="button"
                onClick={() => setInputContent('')}
                className="text-[11px] text-light-body dark:text-dark-body hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            rows={8}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={
              uploadedFile
                ? `Attached file: ${uploadedFile.name}. Click "Run AI Intelligence" to process directly or type additional notes...`
                : `Paste or type the text you want to ${activeTab}...`
            }
            className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
              AI Output
            </label>
            {resultContent && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={downloadAsTxt}
                  className="text-[11px] text-light-body dark:text-dark-body hover:text-light-heading font-semibold px-2 py-0.5 rounded border border-light-border dark:border-dark-border"
                  title="Download as text file"
                >
                  TXT
                </button>
                <button
                  type="button"
                  onClick={downloadAsWord}
                  className="text-[11px] text-light-body dark:text-dark-body hover:text-light-heading font-semibold px-2 py-0.5 rounded border border-light-border dark:border-dark-border"
                  title="Download as Word doc"
                >
                  DOC
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-accent-dark dark:text-accent-light font-semibold flex items-center gap-1 ml-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
          <div className="w-full h-44 sm:h-52 p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading overflow-y-auto text-xs whitespace-pre-wrap leading-relaxed">
            {resultContent ? (
              resultContent
            ) : (
              <div className="h-full flex items-center justify-center text-center text-light-body dark:text-dark-body opacity-50">
                {isProcessing
                  ? 'Docify AI is translating with ultra-fast inference...'
                  : 'Click "Run AI Intelligence" to see results here'}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        className="w-full justify-center bg-accent text-black font-bold shadow-soft hover:shadow-glow-cyan"
        onClick={handleRunAi}
        isLoading={isProcessing}
        disabled={!inputContent.trim() && !uploadedFile}
        leftIcon={Sparkles}
        rightIcon={Send}
      >
        {isProcessing
          ? activeTab === 'translate'
            ? 'Translating Document...'
            : 'Processing with AI...'
          : activeTab === 'translate'
          ? 'Translate Content Now'
          : 'Run AI Intelligence'}
      </Button>
    </div>
  );
};

export default AiQuickTools;
