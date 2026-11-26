import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds,
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
  FolderMinus,
  FolderPlus,
  ArrowRightLeft,
  ArrowUpDown,
  BookOpen,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

/**
 * Root Node Component (Level 0 - Document Central Topic)
 * Red-Orange gradient brand styling
 */
const RootNode = ({ data }) => {
  const isHorizontal = data.orientation !== 'TB';

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #F97316 100%)',
      }}
      className="px-6 py-4 rounded-2xl shadow-xl text-white font-heading max-w-[300px] border border-red-300/40 relative group cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span className="text-[10px] tracking-wider uppercase font-bold text-amber-100/90 bg-white/20 px-2.5 py-0.5 rounded-full">
          Document Root
        </span>
      </div>
      <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-3">
        {data.label}
      </h3>

      <Handle
        type="source"
        position={isHorizontal ? Position.Right : Position.Bottom}
        className="w-3.5 h-3.5 !bg-brand-orange border-2 !border-white shadow"
      />
    </div>
  );
};

/**
 * Main Topic Node Component (Level 1 - Major Document Theme)
 * Distinct branch color theme with expand/collapse badge
 */
const MainTopicNode = ({ id, data }) => {
  const isHorizontal = data.orientation !== 'TB';
  const isCollapsed = data.isCollapsed;
  const childCount = data.childCount || 0;
  const branchColor = data.color || '#6366F1';

  return (
    <div
      style={{
        borderLeftColor: isHorizontal ? branchColor : undefined,
        borderTopColor: !isHorizontal ? branchColor : undefined,
        borderWidth: 2,
      }}
      className="px-5 py-3.5 rounded-2xl shadow-soft dark:shadow-soft-dark bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border max-w-[280px] sm:max-w-[310px] transition-all duration-200 relative group cursor-pointer hover:shadow-md"
    >
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ backgroundColor: branchColor }}
        className="w-3 h-3 border-2 !border-white dark:!border-dark-surface"
      />

      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: branchColor }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: branchColor }}
          >
            Main Topic
          </span>
        </div>

        {childCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onToggleCollapse?.(id);
            }}
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-light-border/60 dark:bg-dark-border/60 text-light-body dark:text-dark-body hover:bg-light-border dark:hover:bg-dark-border transition-colors"
            title={isCollapsed ? 'Expand subtopics' : 'Collapse subtopics'}
          >
            <span>{childCount}</span>
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      <p className="font-heading text-xs sm:text-sm font-bold text-light-heading dark:text-dark-heading leading-snug line-clamp-3">
        {data.label}
      </p>

      {childCount > 0 && (
        <Handle
          type="source"
          position={isHorizontal ? Position.Right : Position.Bottom}
          style={{ backgroundColor: branchColor }}
          className="w-3 h-3 border-2 !border-white dark:!border-dark-surface"
        />
      )}
    </div>
  );
};

/**
 * Subtopic Node Component (Level 2 - Cohesive Sub-section)
 */
const SubtopicNode = ({ id, data }) => {
  const isHorizontal = data.orientation !== 'TB';
  const isCollapsed = data.isCollapsed;
  const childCount = data.childCount || 0;
  const branchColor = data.color || '#06B6D4';

  return (
    <div
      style={{
        borderLeftColor: isHorizontal ? branchColor : undefined,
        borderTopColor: !isHorizontal ? branchColor : undefined,
        borderWidth: 1.5,
      }}
      className="px-4 py-3 rounded-xl shadow-xs bg-light-surface dark:bg-dark-surface border-light-border/90 dark:border-dark-border/90 max-w-[250px] sm:max-w-[275px] transition-all relative group cursor-pointer hover:border-accent/60"
    >
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ backgroundColor: branchColor }}
        className="w-2.5 h-2.5 border-2 !border-white dark:!border-dark-surface"
      />

      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider flex items-center gap-1">
          <BookOpen className="w-2.5 h-2.5 text-accent" />
          Subtopic
        </span>
        {childCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onToggleCollapse?.(id);
            }}
            className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-light-border/50 dark:bg-dark-border/50 text-light-body dark:text-dark-body hover:bg-light-border dark:hover:bg-dark-border"
            title={isCollapsed ? 'Expand concepts' : 'Collapse concepts'}
          >
            <span>{childCount}</span>
            {isCollapsed ? <ChevronRight className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
        )}
      </div>

      <p className="font-heading text-xs font-semibold text-light-heading dark:text-dark-heading leading-snug line-clamp-3">
        {data.label}
      </p>

      {childCount > 0 && (
        <Handle
          type="source"
          position={isHorizontal ? Position.Right : Position.Bottom}
          style={{ backgroundColor: branchColor }}
          className="w-2.5 h-2.5 border-2 !border-white dark:!border-dark-surface"
        />
      )}
    </div>
  );
};

/**
 * Concept Node Component (Level 3 - Important Concept / Definition)
 */
const ConceptNode = ({ id, data }) => {
  const isHorizontal = data.orientation !== 'TB';
  const isCollapsed = data.isCollapsed;
  const childCount = data.childCount || 0;
  const branchColor = data.color || '#10B981';

  return (
    <div className="px-3.5 py-2.5 rounded-lg shadow-xs bg-light-surface/95 dark:bg-dark-surface/95 border border-light-border dark:border-dark-border hover:border-emerald-500/50 max-w-[230px] sm:max-w-[250px] transition-all relative group cursor-pointer">
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ backgroundColor: branchColor }}
        className="w-2 h-2 border !border-white dark:!border-dark-surface"
      />

      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <Lightbulb className="w-2.5 h-2.5" />
          Concept
        </span>
        {childCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              data.onToggleCollapse?.(id);
            }}
            className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-light-border/40 dark:bg-dark-border/40 text-light-body dark:text-dark-body"
            title={isCollapsed ? 'Expand details' : 'Collapse details'}
          >
            <span>{childCount}</span>
            {isCollapsed ? <ChevronRight className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
        )}
      </div>

      <p className="text-xs font-medium text-light-heading dark:text-dark-heading leading-snug line-clamp-3">
        {data.label}
      </p>

      {childCount > 0 && (
        <Handle
          type="source"
          position={isHorizontal ? Position.Right : Position.Bottom}
          style={{ backgroundColor: branchColor }}
          className="w-2 h-2 border !border-white dark:!border-dark-surface"
        />
      )}
    </div>
  );
};

/**
 * Detail Node Component (Level 4 - Supporting Detail, Example, or Formula)
 */
const DetailNode = ({ data }) => {
  const isHorizontal = data.orientation !== 'TB';
  const branchColor = data.color || '#F59E0B';

  return (
    <div className="px-3 py-2 rounded-lg shadow-xs bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border/80 dark:border-dark-border/80 hover:border-amber-500/50 max-w-[220px] sm:max-w-[240px] transition-all relative">
      <Handle
        type="target"
        position={isHorizontal ? Position.Left : Position.Top}
        style={{ backgroundColor: branchColor }}
        className="w-2 h-2 border !border-white dark:!border-dark-surface"
      />
      <div className="flex items-start gap-1.5">
        <span className="text-amber-500 text-xs font-bold leading-tight mt-0.5">•</span>
        <p className="text-[11px] text-light-body dark:text-dark-body leading-relaxed line-clamp-3 font-normal">
          {data.label}
        </p>
      </div>
    </div>
  );
};

const nodeTypes = {
  root: RootNode,
  mainTopic: MainTopicNode,
  subtopic: SubtopicNode,
  concept: ConceptNode,
  detail: DetailNode,
};

/**
 * Flow Inner Canvas with Layout Controls & Full PNG Export
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

  // Layout orientation: 'LR' (Left-to-Right) or 'TB' (Top-to-Bottom)
  const [orientation, setOrientation] = useState('LR');

  // Set of collapsed node IDs
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  const [isExporting, setIsExporting] = useState(false);

  // Toggle single node collapse
  const handleToggleCollapse = useCallback((nodeId) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Collect all expandable node IDs
  const allExpandableIds = useMemo(() => {
    const ids = [];
    if (!rawTree || !rawTree.children) return ids;

    const traverse = (node) => {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        node.children.forEach(traverse);
      }
    };
    rawTree.children.forEach(traverse);
    return ids;
  }, [rawTree]);

  // Expand All
  const handleExpandAll = useCallback(() => {
    setCollapsedNodes(new Set());
  }, []);

  // Collapse All
  const handleCollapseAll = useCallback(() => {
    setCollapsedNodes(new Set(allExpandableIds));
  }, [allExpandableIds]);

  // Compute Layout: Dynamic 4-tier tree in LR or TB orientation
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!rawTree || !rawTree.id) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes = [];
    const edges = [];
    const isLR = orientation === 'LR';

    // Helper to calculate visible subtree size for collision-free layout
    const getSubtreeSize = (node) => {
      if (collapsedNodes.has(node.id) || !node.children || node.children.length === 0) {
        return 1;
      }
      return node.children.reduce((sum, child) => sum + getSubtreeSize(child), 0);
    };

    let crossOffset = 50; // Y in LR mode, X in TB mode
    const mainTopics = rawTree.children || [];

    // Precalculate topic branch positions
    const mainTopicPlacements = mainTopics.map((topic, tIdx) => {
      const topicSize = getSubtreeSize(topic);
      const span = isLR ? Math.max(160, topicSize * 95) : Math.max(260, topicSize * 240);
      const centerCoord = crossOffset + span / 2 - (isLR ? 40 : 80);
      const placement = { topic, topicSize, span, centerCoord, startOffset: crossOffset };
      crossOffset += span + (isLR ? 40 : 60);
      return placement;
    });

    const rootCross = crossOffset > 150 ? crossOffset / 2 - (isLR ? 50 : 100) : 100;

    // Root Node (Level 0)
    nodes.push({
      id: rawTree.id,
      type: 'root',
      position: isLR ? { x: 50, y: rootCross } : { x: rootCross, y: 50 },
      data: {
        label: rawTree.label || documentTitle || 'Document Root',
        orientation,
      },
    });

    // Level 1: Main Topics
    mainTopicPlacements.forEach(({ topic, centerCoord, startOffset }) => {
      const branchColor = topic.color || '#6366F1';
      const isTopicCollapsed = collapsedNodes.has(topic.id);
      const subtopics = topic.children || [];

      nodes.push({
        id: topic.id,
        type: 'mainTopic',
        position: isLR ? { x: 440, y: centerCoord } : { x: centerCoord, y: 280 },
        data: {
          label: topic.label,
          level: 1,
          color: branchColor,
          childCount: subtopics.length,
          isCollapsed: isTopicCollapsed,
          orientation,
          onToggleCollapse: handleToggleCollapse,
        },
      });

      // Edge from Root to Main Topic
      edges.push({
        id: `e-${rawTree.id}-${topic.id}`,
        source: rawTree.id,
        target: topic.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: branchColor, strokeWidth: 2.5 },
      });

      // If Main Topic not collapsed, layout Level 2: Subtopics
      if (!isTopicCollapsed && subtopics.length > 0) {
        let subCrossOffset = startOffset + 10;

        subtopics.forEach((subtopic) => {
          const subSize = getSubtreeSize(subtopic);
          const subSpan = isLR ? Math.max(110, subSize * 90) : Math.max(220, subSize * 210);
          const subCenter = subCrossOffset + subSpan / 2 - (isLR ? 30 : 60);
          const isSubCollapsed = collapsedNodes.has(subtopic.id);
          const concepts = subtopic.children || [];

          nodes.push({
            id: subtopic.id,
            type: 'subtopic',
            position: isLR ? { x: 820, y: subCenter } : { x: subCenter, y: 530 },
            data: {
              label: subtopic.label,
              level: 2,
              color: branchColor,
              childCount: concepts.length,
              isCollapsed: isSubCollapsed,
              orientation,
              onToggleCollapse: handleToggleCollapse,
            },
          });

          // Edge from Main Topic to Subtopic
          edges.push({
            id: `e-${topic.id}-${subtopic.id}`,
            source: topic.id,
            target: subtopic.id,
            type: 'smoothstep',
            style: { stroke: branchColor, strokeWidth: 2, opacity: 0.85 },
          });

          // If Subtopic not collapsed, layout Level 3: Concepts
          if (!isSubCollapsed && concepts.length > 0) {
            let conceptCrossOffset = subCrossOffset + 5;

            concepts.forEach((concept) => {
              const conSize = getSubtreeSize(concept);
              const conSpan = isLR ? Math.max(80, conSize * 85) : Math.max(180, conSize * 180);
              const conCenter = conceptCrossOffset + conSpan / 2 - (isLR ? 25 : 50);
              const isConCollapsed = collapsedNodes.has(concept.id);
              const details = concept.children || [];

              nodes.push({
                id: concept.id,
                type: 'concept',
                position: isLR ? { x: 1180, y: conCenter } : { x: conCenter, y: 770 },
                data: {
                  label: concept.label,
                  level: 3,
                  color: branchColor,
                  childCount: details.length,
                  isCollapsed: isConCollapsed,
                  orientation,
                  onToggleCollapse: handleToggleCollapse,
                },
              });

              // Edge from Subtopic to Concept
              edges.push({
                id: `e-${subtopic.id}-${concept.id}`,
                source: subtopic.id,
                target: concept.id,
                type: 'smoothstep',
                style: { stroke: branchColor, strokeWidth: 1.5, strokeDasharray: '4 2' },
              });

              // If Concept not collapsed, layout Level 4: Details
              if (!isConCollapsed && details.length > 0) {
                let detailCross = conceptCrossOffset + 5;
                details.forEach((detail) => {
                  nodes.push({
                    id: detail.id,
                    type: 'detail',
                    position: isLR ? { x: 1520, y: detailCross } : { x: detailCross, y: 1000 },
                    data: {
                      label: detail.label,
                      level: 4,
                      color: branchColor,
                      orientation,
                    },
                  });

                  // Edge from Concept to Detail
                  edges.push({
                    id: `e-${concept.id}-${detail.id}`,
                    source: concept.id,
                    target: detail.id,
                    type: 'smoothstep',
                    style: { stroke: branchColor, strokeWidth: 1.2, strokeDasharray: '2 2' },
                  });

                  detailCross += isLR ? 80 : 200;
                });
              }

              conceptCrossOffset += conSpan + (isLR ? 20 : 30);
            });
          }

          subCrossOffset += subSpan + (isLR ? 25 : 40);
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [rawTree, collapsedNodes, orientation, documentTitle, handleToggleCollapse]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state whenever tree or orientation changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    const timer = setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 120);
    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  // Export Mind Map as Complete, High-Resolution PNG without Cutoffs
  const handleExportPng = async () => {
    if (!reactFlowWrapper.current || nodes.length === 0) return;
    setIsExporting(true);
    try {
      const viewportEl = reactFlowWrapper.current.querySelector('.react-flow__viewport');
      if (!viewportEl) {
        alert('Could not locate mind map canvas element.');
        return;
      }

      // Calculate the complete bounding box of all nodes
      const nodesBounds = getNodesBounds(nodes);
      const padding = 80;
      const imageWidth = Math.max(900, Math.round(nodesBounds.width + padding * 2));
      const imageHeight = Math.max(650, Math.round(nodesBounds.height + padding * 2));

      // Calculate perfect viewport transform for full-scale unclipped snapshot
      const transform = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.2,
        2.5,
        0.1
      );

      const isDark = document.documentElement.classList.contains('dark');

      const dataUrl = await toPng(viewportEl, {
        backgroundColor: isDark ? '#0A0E1A' : '#F8FAFC',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
        pixelRatio: 2,
        filter: (el) => {
          if (el?.classList?.contains('react-flow__controls') || el?.classList?.contains('react-flow__minimap')) {
            return false;
          }
          return true;
        },
      });

      const safeTitle = (documentTitle || 'mindmap')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 45);

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
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 shadow-soft">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Language Toggle & Orientation */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Multilingual Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border shadow-md backdrop-blur">
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

          {/* Orientation Toggle (Horizontal LR vs Vertical TB) */}
          <div className="flex items-center p-1 rounded-xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border shadow-md backdrop-blur">
            <button
              onClick={() => setOrientation('LR')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                orientation === 'LR'
                  ? 'bg-brand-orange text-white shadow-xs'
                  : 'text-light-body dark:text-dark-body hover:bg-light-border/40 dark:hover:bg-dark-border/40'
              }`}
              title="Horizontal Left-to-Right Layout"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Horizontal</span>
            </button>
            <button
              onClick={() => setOrientation('TB')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                orientation === 'TB'
                  ? 'bg-brand-orange text-white shadow-xs'
                  : 'text-light-body dark:text-dark-body hover:bg-light-border/40 dark:hover:bg-dark-border/40'
              }`}
              title="Vertical Top-to-Bottom Layout"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Vertical</span>
            </button>
          </div>
        </div>

        {/* Right: Actions (Expand/Collapse All, Fit View, Zoom, Refresh, Export PNG) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border shadow-md backdrop-blur pointer-events-auto">
          {/* Expand All / Collapse All */}
          <button
            onClick={handleExpandAll}
            className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
            title="Expand All Branches"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={handleCollapseAll}
            className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
            title="Collapse All Branches"
          >
            <FolderMinus className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-light-border dark:bg-dark-border mx-0.5" />

          {/* Zoom & Fit */}
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
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-light-border dark:bg-dark-border mx-0.5" />

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-light-body dark:text-dark-body hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors"
            title="Regenerate Mind Map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-orange' : ''}`} />
          </button>

          {/* Export PNG */}
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
          minZoom={0.15}
          maxZoom={2.4}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#71717A" gap={22} size={1} opacity={0.12} />
          <MiniMap
            nodeStrokeColor="#F97316"
            nodeColor={(n) => {
              if (n.type === 'root') return '#DC2626';
              if (n.type === 'mainTopic') return n.data?.color || '#6366F1';
              if (n.type === 'subtopic') return n.data?.color || '#06B6D4';
              if (n.type === 'concept') return '#10B981';
              return '#F59E0B';
            }}
            className="!bottom-4 !left-4 !bg-light-surface/90 dark:!bg-dark-surface/90 !border !border-light-border dark:!border-dark-border !rounded-xl !shadow-md backdrop-blur overflow-hidden"
            maskColor="rgba(0, 0, 0, 0.2)"
          />
        </ReactFlow>
      </div>

      {/* Hierarchy Legend Badge */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border text-[11px] text-light-body dark:text-dark-body shadow-md backdrop-blur">
        <span className="flex items-center gap-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500" /> Document Root
        </span>
        <span className="flex items-center gap-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Main Topic
        </span>
        <span className="flex items-center gap-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Subtopic
        </span>
        <span className="flex items-center gap-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Concept
        </span>
        <span className="flex items-center gap-1 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Detail
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
          Synthesizing Universal Mind Map...
        </h3>
        <p className="text-xs text-light-body dark:text-dark-body max-w-sm mx-auto">
          Deep-analyzing document pages, tables, definitions, and logical hierarchies in{' '}
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
