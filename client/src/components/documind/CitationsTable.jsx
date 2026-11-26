import React, { useState, useMemo } from 'react';
import {
  BookMarked,
  Search,
  Download,
  Copy,
  Check,
  ExternalLink,
  Filter,
  FileCode,
  RefreshCw,
  Globe,
  FileText,
  Book,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

/**
 * Converts citations array to BibTeX format string
 */
const citationsToBibtex = (citations, docTitle = 'docify') => {
  return citations
    .map((c, i) => {
      const citeKey = (c.authors?.[0] || 'ref')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') + (c.year || '2026') + `_${i + 1}`;

      const entryType = c.type === 'book' ? 'book' : c.type === 'website' ? 'misc' : 'article';
      const authorsStr = (c.authors || ['Unknown']).join(' and ');

      return `@${entryType}{${citeKey},
  author    = {${authorsStr}},
  title     = {${c.title || 'Untitled Reference'}},
  year      = {${c.year || '2026'}},
  url       = {${c.url || ''}},
  note      = {Extracted via Docify Research Toolkit}
}`;
    })
    .join('\n\n');
};

/**
 * Formats a citation entry into standard APA string
 */
const formatApa = (c) => {
  const authors = (c.authors || ['Unknown Author']).join(', ');
  const year = c.year ? `(${c.year})` : '(n.d.)';
  const title = c.title ? `${c.title}.` : '';
  const url = c.url ? ` Retrieved from ${c.url}` : '';
  return `${authors} ${year}. ${title}${url}`;
};

/**
 * Formats a citation entry into standard MLA string
 */
const formatMla = (c) => {
  const author = c.authors?.[0] || 'Unknown Author';
  const title = c.title ? `"${c.title}."` : '';
  const year = c.year || '2026';
  const url = c.url ? ` Web. <${c.url}>` : '';
  return `${author}. ${title} ${year}.${url}`;
};

export const CitationsTable = ({
  citations = [],
  loading = false,
  onRefresh,
  documentTitle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Filter citations
  const filteredCitations = useMemo(() => {
    return (citations || []).filter((c) => {
      const matchesType = selectedType === 'all' || c.type === selectedType;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.title?.toLowerCase().includes(lowerSearch) ||
        c.raw?.toLowerCase().includes(lowerSearch) ||
        c.authors?.some((a) => a.toLowerCase().includes(lowerSearch)) ||
        c.year?.includes(searchTerm);

      return matchesType && matchesSearch;
    });
  }, [citations, selectedType, searchTerm]);

  // Export BibTeX
  const handleExportBibtex = () => {
    if (filteredCitations.length === 0) return;
    const bibtex = citationsToBibtex(filteredCitations, documentTitle);
    const blob = new Blob([bibtex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(documentTitle || 'citations').toLowerCase().replace(/[^a-z0-9]/g, '-')}.bib`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySingle = (c, format = 'apa', id) => {
    const text = format === 'apa' ? formatApa(c) : formatMla(c);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'book':
        return <Book className="w-3.5 h-3.5 text-amber-400" />;
      case 'website':
        return <Globe className="w-3.5 h-3.5 text-accent" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-brand-orange" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border shadow-soft">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-light-body dark:text-dark-body absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by author, title, DOI, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'paper', label: 'Papers' },
            { id: 'book', label: 'Books' },
            { id: 'website', label: 'Websites' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === type.id
                  ? 'bg-brand-red text-white shadow-xs'
                  : 'text-light-body dark:text-dark-body hover:bg-light-border/40 dark:hover:bg-dark-border/40'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: BibTeX Export & Refresh */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportBibtex}
            disabled={filteredCitations.length === 0}
            leftIcon={FileCode}
            title="Download citations as .bib BibTeX file"
          >
            Export .bib
          </Button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-border/40 dark:hover:bg-dark-border/40 text-light-body dark:text-dark-body transition-colors"
              title="Re-extract citations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-orange' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Citations List Table */}
      <Card className="p-0 overflow-hidden border-light-border dark:border-dark-border">
        {filteredCitations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-light-surface/60 dark:bg-dark-surface/60 text-[11px] font-heading font-semibold uppercase tracking-wider text-light-body dark:text-dark-body">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Reference Title & Source</th>
                  <th className="py-3 px-4">Authors</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border text-xs">
                {filteredCitations.map((c, idx) => {
                  const uniqueId = `cite-${idx}`;
                  const isCopied = copiedId === uniqueId;

                  return (
                    <tr
                      key={uniqueId}
                      className="hover:bg-light-surface/40 dark:hover:bg-dark-surface/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-light-body/60 dark:text-dark-body/60">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-light-heading dark:text-dark-heading leading-snug line-clamp-2">
                            {c.title}
                          </p>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline line-clamp-1"
                            >
                              <span>{c.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-light-body dark:text-dark-body whitespace-nowrap">
                        {(c.authors || ['Unknown']).slice(0, 2).join(', ')}
                        {c.authors?.length > 2 && ' et al.'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-light-body dark:text-dark-body">
                        {c.year || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-light-border/40 dark:bg-dark-border/40 text-light-body dark:text-dark-body capitalize">
                          {getTypeIcon(c.type)}
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySingle(c, 'apa', uniqueId)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-md border border-light-border dark:border-dark-border hover:border-accent hover:text-accent transition-colors"
                            title="Copy formatted APA citation"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-status-success inline" /> : 'APA'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopySingle(c, 'mla', `${uniqueId}-mla`)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-md border border-light-border dark:border-dark-border hover:border-brand-orange hover:text-brand-orange transition-colors"
                            title="Copy formatted MLA citation"
                          >
                            {copiedId === `${uniqueId}-mla` ? (
                              <Check className="w-3 h-3 text-status-success inline" />
                            ) : (
                              'MLA'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <BookMarked className="w-10 h-10 text-light-body dark:text-dark-body mx-auto opacity-30" />
            <h4 className="font-heading font-semibold text-sm text-light-heading dark:text-dark-heading">
              No citations found matching your filter
            </h4>
            <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
              Extract citations from documents containing references, bibliographies, DOIs, or external sources.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CitationsTable;