import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Languages,
  Check,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

/**
 * Root Node Component
 * Styled with red-orange brand gradient: linear-gradient(135deg, #DC2626, #F97316)
 */
const RootNode = ({ data }) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #DC2626 0%, #F97316 100%)',
      }}
      className="px-6 py-4 rounded-2xl shadow-xl text-white font-heading max-w-[280px] sm:max-w-[320px] border border-red-300/40 relative group cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span className="text-[10px] tracking-wider uppercase font-bold text-amber-100/90 bg-white/20 px-2 py-0.5 rounded-full">
          Central Topic
        </span>
      </div>
      <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-3">
        {data.label}
      </h3>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-brand-orange border-2 !border-white shadow"
      />
    </div>
  );
};

/**
 * Branch Node Component (Subtopic)
 * Features dark/light card surface and interactive collapse toggle
 */
const BranchNode = ({ id, data }) => {
  const isCollapsed = data.isCollapsed;
  const childCount = data.childCount || 0;

  return (
    <div className="px-5 py-3.5 rounded-2xl shadow-soft dark:shadow-soft-dark bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-brand-orange/60 dark:hover:border-brand-orange/60 max-w-[260px] sm:max-w-[290px] transition-all duration-200 relative group cursor-pointer">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-brand-orange border-2 !border-white dark:!border-dark-surface"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          <span className="text-[11px] font-semibold text-brand-orange uppercase tracking-wider">
            Subtopic
          </span>
        </div>

        {childCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onToggleCollapse?.(id);
            }}
            className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-light-border/60 dark:bg-dark-border/60 text-light-body dark:text-dark-body hover:text-brand-orange dark:hover:text-brand-orange transition-colors"
            title={isCollapsed ? 'Expand sub-branch' : 'Collapse sub-branch'}
          >
            <span>{childCount}</span>
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-brand-orange" />
            ) : (
              <ChevronDown className="w-3 h-3 text-brand-orange" />
            )}
          </button>
        )}
      </div>

      <p className="mt-1.5 font-heading text-xs sm:text-sm font-semibold text-light-heading dark:text-dark-heading leading-snug line-clamp-3">
        {data.label}
      </p>

      {childCount > 0 && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5 h-2.5 !bg-accent border-2 !border-white dark:!border-dark-surface"
        />
      )}
    </div>
  );
};

/**
 * Leaf Node Component (Key Detail)
 * Sleek card surface with accent bullet
 */
const LeafNode = ({ data }) => {
  return (
    <div className="px-4 py-2.5 rounded-xl shadow-xs bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border/80 dark:border-dark-border/80 hover:border-accent/50 dark:hover:border-accent/50 max-w-[240px] sm:max-w-[270px] transition-all relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-accent border !border-white dark:!border-dark-surface"
      />
      <div className="flex items-start gap-2">
        <span className="text-accent text-xs font-bold leading-tight mt-0.5">•</span>
        <p className="text-xs text-light-heading dark:text-dark-heading leading-relaxed line-clamp-3 font-normal">
          {data.label}
        </p>
      </div>
    </div>
  );
};

const nodeTypes = {
  root: RootNode,
  branch: BranchNode,
  leaf: LeafNode,
};

/**
 * Flow Inner Canvas with Flow controls
 */
const MindMapCanvas = ({
  rawTree,
  language,
  onLanguageChange,
  onRefresh,
  loading,
  documentTitle,
}) => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const reactFlowWrapper = useRef(null);

  // Set of collapsed branch IDs
  const [collapsedBranches, setCollapsedBranches] = useState(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Toggle branch collapse
  const handleToggleCollapse = useCallback((branchId) => {
    setCollapsedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  }, []);

  // Compute Layout: Nodes & Edges from rawTree
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!rawTree || !rawTree.id) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes = [];
    const edges = [];

    const branches = rawTree.children || [];
    const visibleBranches = branches;

    // Calculate vertical spacing based on children counts
    let currentY = 50;
    const branchPositions = [];

    visibleBranches.forEach((branch, bIdx) => {
      const isCollapsed = collapsedBranches.has(branch.id);
      const leaves = branch.children || [];
      const leafCount = isCollapsed ? 0 : leaves.length;

      // Height occupied by this branch family
      const familyHeight = Math.max(140, leafCount * 90);
      const branchCenterY = currentY + familyHeight / 2 - 40;
      branchPositions.push({ branch, branchCenterY, leaves, isCollapsed, startY: currentY });
      currentY += familyHeight + 40;
    });

    const rootY = currentY > 150 ? currentY / 2 - 60 : 100;

    // Root Node
    nodes.push({
      id: rawTree.id,
      type: 'root',
      position: { x: 50, y: rootY },
      data: { label: rawTree.label || documentTitle || 'Central Topic' },
    });

    // Subtopic Nodes & Leaf Nodes
    branchPositions.forEach(({ branch, branchCenterY, leaves, isCollapsed, startY }) => {
      const branchX = 430;
      nodes.push({
        id: branch.id,
        type: 'branch',
        position: { x: branchX, y: branchCenterY },
        data: {
          label: branch.label,
          childCount: leaves.length,
          isCollapsed,
          onToggleCollapse: handleToggleCollapse,
        },
      });

      // Edge from Root to Branch
      edges.push({
        id: `e-${rawTree.id}-${branch.id}`,
        source: rawTree.id,
        target: branch.id,
        animated: true,
        style: { stroke: '#F97316', strokeWidth: 2 },
      });

      // If not collapsed, render leaves and edges
      if (!isCollapsed && leaves.length > 0) {
        const leafX = 780;
        let leafY = startY + 10;
        leaves.forEach((leaf) => {
          nodes.push({
            id: leaf.id,
            type: 'leaf',
            position: { x: leafX, y: leafY },
            data: { label: leaf.label },
          });

          edges.push({
            id: `e-${branch.id}-${leaf.id}`,
            source: branch.id,
            target: leaf.id,
            style: { stroke: '#06B6D4', strokeWidth: 1.5, strokeDasharray: '4 2' },
          });

          leafY += 85;
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [rawTree, collapsedBranches, documentTitle, handleToggleCollapse]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when tree changes or branches collapse
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    // Auto-fit on layout change
    const timer = setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 100);
    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  // Export Mind Map as crisp PNG
  const handleExportPng = async () => {
    if (!reactFlowWrapper.current) return;
    setIsExporting(true);
    try {
      const viewportEl = reactFlowWrapper.current.querySelector('.react-flow__viewport');
      if (!viewportEl) {
        alert('Could not locate mind map canvas element.');
        return;
      }

      // Check current dark mode
      const isDark = document.documentElement.classList.contains('dark');

      const dataUrl = await toPng(viewportEl, {
        backgroundColor: isDark ? '#111111' : '#FFFFFF',
        quality: 0.95,
        pixelRatio: 2,
        filter: (node) => {
          // Exclude controls from snapshot
          if (node?.classList?.contains('react-flow__controls')) return false;
          return true;
        },
      });

      const safeTitle = (documentTitle || 'mindmap')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `${safeTitle}-mindmap.png`;
      downloadLink.click();
    } catch (err) {
      console.error('Mind map export error:', err);
      alert('Failed to export mind map as image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 shadow-soft">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Language Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border shadow-md backdrop-blur pointer-events-auto">
          {[
            { code: 'en', label: 'English' },
            { code: 'gu', label: 'ગુજરાતી' },
            { code: 'hi', label: 'हिन्दी' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => onLanguageChange(l.code)}
              disabled={loading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === l.code
                  ? 'bg-brand-red text-white shadow-xs'
                  : 'text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading hover:bg-light-border/40 dark:hover:bg-dark-border/40'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Right: Actions (Fit View, Zoom, Refresh, Export PNG) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border shadow-md backdrop-blur pointer-events-auto">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => fitView({ padding: 0.25, duration: 400 })}
            className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
            title="Fit View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-light-border dark:bg-dark-border mx-0.5" />

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
            title="Regenerate Mind Map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-orange' : ''}`} />
          </button>

          <Button
            size="sm"
            onClick={handleExportPng}
            isLoading={isExporting}
            leftIcon={Download}
            className="!py-1 !px-3 text-xs bg-brand-gradient text-white shadow-xs"
          >
            Export PNG
          </Button>
        </div>
      </div>

      {/* React Flow Container */}
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2.2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        >
          <Background color="#71717A" gap={20} size={1} opacity={0.15} />
          <MiniMap
            nodeStrokeColor="#F97316"
            nodeColor={(n) => {
              if (n.type === 'root') return '#DC2626';
              if (n.type === 'branch') return '#F97316';
              return '#06B6D4';
            }}
            className="!bottom-4 !left-4 !bg-light-surface/90 dark:!bg-dark-surface/90 !border !border-light-border dark:!border-dark-border !rounded-xl !shadow-md backdrop-blur overflow-hidden"
            maskColor="rgba(0, 0, 0, 0.2)"
          />
        </ReactFlow>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border text-[11px] text-light-body dark:text-dark-body shadow-md backdrop-blur">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500" /> Root
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" /> Subtopic
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Key Detail
        </span>
      </div>
    </div>
  );
};

/**
 * MindMapViewer Wrapper with Provider
 */
export const MindMapViewer = ({
  documentId,
  documentTitle,
  initialMindMap = null,
  onFetchMindMap,
}) => {
  const [mindMapData, setMindMapData] = useState(initialMindMap);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load mind map
  const loadMindMap = useCallback(
    async (lang = language, force = false) => {
      if (!documentId) return;
      setLoading(true);
      setError(null);
      try {
        if (onFetchMindMap) {
          const res = await onFetchMindMap(documentId, lang, force);
          setMindMapData(res?.data?.mindMap || res?.mindMap || null);
        }
      } catch (err) {
        console.error('Error loading mind map:', err);
        setError(err.message || 'Failed to render visual mind map.');
      } finally {
        setLoading(false);
      }
    },
    [documentId, language, onFetchMindMap]
  );

  useEffect(() => {
    if (!initialMindMap && documentId) {
      loadMindMap('en', false);
    } else if (initialMindMap) {
      setMindMapData(initialMindMap);
    }
  }, [documentId, initialMindMap, loadMindMap]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    loadMindMap(newLang, false);
  };

  const handleRefresh = () => {
    loadMindMap(language, true);
  };

  if (loading && !mindMapData) {
    return (
      <Card className="p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-orange border-t-transparent animate-spin mx-auto" />
        <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
          Synthesizing Visual Knowledge Graph...
        </h3>
        <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
          Extracting document hierarchies, core entities, and subtopic connections in{' '}
          {language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिन्दी' : 'English'}.
        </p>
      </Card>
    );
  }

  if (error && !mindMapData) {
    return (
      <Card className="p-8 text-center space-y-4 border-status-error/40">
        <GitBranch className="w-10 h-10 text-status-error mx-auto opacity-70" />
        <h3 className="font-heading font-semibold text-sm text-status-error">
          Unable to generate visual mind map
        </h3>
        <p className="text-xs text-light-body dark:text-dark-body max-w-md mx-auto">{error}</p>
        <Button size="sm" onClick={() => loadMindMap(language, true)} leftIcon={RefreshCw}>
          Retry Synthesis
        </Button>
      </Card>
    );
  }

  if (!mindMapData) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <MindMapCanvas
        rawTree={mindMapData}
        language={language}
        onLanguageChange={handleLanguageChange}
        onRefresh={handleRefresh}
        loading={loading}
        documentTitle={documentTitle}
      />
    </ReactFlowProvider>
  );
};

export default MindMapViewer;