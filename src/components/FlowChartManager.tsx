// FlowChartManager.ts
// Handles creation and management of flowchart nodes and links with type safety.

import type { FlowChartData, FlowChartNode, FlowChartLink } from './FlowChartData';
import type { ReactNode } from 'react';

export class FlowChartManager<T = unknown> {
  private nodes: Map<string, FlowChartNode<T>> = new Map();
  private links: Map<string, FlowChartLink<T>> = new Map();

  constructor(data?: FlowChartData) {
    if (data) {
      this.importData(data);
    }
  }

  addNode(node: FlowChartNode<T>): void {
    this.nodes.set(node.id, node);
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    // Remove links connected to this node
    for (const [linkId, link] of this.links) {
      if (link.source === nodeId || link.target === nodeId) {
        this.links.delete(linkId);
      }
    }
  }

  addLink(link: FlowChartLink<T>): void {
    if (this.nodes.has(link.source) && this.nodes.has(link.target)) {
      this.links.set(link.id, link);
    } else {
      throw new Error('Both source and target nodes must exist');
    }
  }

  removeLink(linkId: string): void {
    this.links.delete(linkId);
  }

  getNodes(): FlowChartNode<T>[] {
    return Array.from(this.nodes.values());
  }

  getLinks(): FlowChartLink<T>[] {
    return Array.from(this.links.values());
  }

  clear(): void {
    this.nodes.clear();
    this.links.clear();
  }

  exportData(): FlowChartData {
    return {
      nodes: this.getNodes(),
      links: this.getLinks(),
    };
  }

  importData(data: FlowChartData): void {
    this.clear();
    data.nodes.forEach(node => this.nodes.set(node.id, node));
    data.links.forEach(link => this.links.set(link.id, link));
  }

  /**
   * Draws the flowchart as a React element.
   * @param nodeRenderer - Function to render a node given its data
   * @param lineStyle - Optional CSS properties to style the lines
   * @returns JSX.Element representing the flowchart
   */
  drawFlowChart(
    nodeRenderer: (node: FlowChartNode<T>) => ReactNode,
    lineStyle?: React.CSSProperties
  ): React.ReactElement {
    const nodes = this.getNodes();
    const links = this.getLinks();
  
    // 🧠 Corrected edge-based attach point calculation
    function getAttachPoint(
      nodePos: { x: number; y: number },
      nodeSize: { width: number; height: number },
      targetPos: { x: number; y: number },
      targetSize: { width: number; height: number }
    ) {
      const cx = nodePos.x + nodeSize.width / 2;
      const cy = nodePos.y + nodeSize.height / 2;
      const tx = targetPos.x + targetSize.width / 2;
      const ty = targetPos.y + targetSize.height / 2;
  
      const dx = tx - cx;
      const dy = ty - cy;
  
      let direction: 'left' | 'right' | 'top' | 'bottom';
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'bottom' : 'top';
      }
  
      switch (direction) {
        case 'left':
          return { x: nodePos.x, y: cy, direction };
        case 'right':
          return { x: nodePos.x + nodeSize.width, y: cy, direction };
        case 'top':
          return { x: cx, y: nodePos.y, direction };
        case 'bottom':
          return { x: cx, y: nodePos.y + nodeSize.height, direction };
      }
    }
  
    // 🎯 Curved cubic bezier path with direction-based control points
    function getCubicPathWithDirs(
      x1: number,
      y1: number,
      dir1: string,
      x2: number,
      y2: number,
      dir2: string
    ): string {
      const offset = 40;
      let c1x = x1, c1y = y1, c2x = x2, c2y = y2;
  
      switch (dir1) {
        case 'right': c1x += offset; break;
        case 'left': c1x -= offset; break;
        case 'top': c1y -= offset; break;
        case 'bottom': c1y += offset; break;
      }
  
      switch (dir2) {
        case 'right': c2x += offset; break;
        case 'left': c2x -= offset; break;
        case 'top': c2y -= offset; break;
        case 'bottom': c2y += offset; break;
      }
  
      return `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
    }
  
    const [hoveredLinkId, setHoveredLinkId] = (typeof window !== 'undefined')
      ? (window as any).flowchartLinkHoverState || [null, () => {}]
      : [null, () => {}];
  
    return (
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
        <defs>
          
          <linearGradient id="flow-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2196f3">
              <animate attributeName="stop-color" values="#2196f3;#21cbf3;#2196f3" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#21cbf3">
              <animate attributeName="stop-color" values="#21cbf3;#2196f3;#21cbf3" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
  
        {links.map(link => {
          const source = this.nodes.get(link.source);
          const target = this.nodes.get(link.target);
          if (!source || !target) return null;
  
          const sourcePos = source.data.position || { x: 0, y: 0 };
          const targetPos = target.data.position || { x: 0, y: 0 };
          const sourceSize = source.data.size;
          const targetSize = target.data.size;
  
          const sourceAttach = getAttachPoint(sourcePos, sourceSize, targetPos, targetSize);
          const targetAttach = getAttachPoint(targetPos, targetSize, sourcePos, sourceSize);
  
          const path = getCubicPathWithDirs(
            sourceAttach.x,
            sourceAttach.y,
            sourceAttach.direction,
            targetAttach.x,
            targetAttach.y,
            targetAttach.direction
          );
  
          let stroke = link.style?.stroke || '#888';
          if (link.type === 'highlighted') stroke = '#2196f3';
          if (link.type === 'dashed') stroke = '#aaa';
  
          const isHovered = hoveredLinkId === link.id;
          const animatedStroke = isHovered ? 'url(#flow-gradient)' : stroke;
          const markerEnd = link.markerEnd?.type === 'arrow' ? 'url(#arrowhead)' : undefined;
  
          return (
            <path
              key={link.id}
              d={path}
              stroke={animatedStroke}
              strokeWidth={link.style?.strokeWidth || 2}
              fill="none"
              markerEnd={markerEnd}
              style={{
                ...lineStyle,
                ...link.style,
                filter: isHovered ? 'drop-shadow(0 0 6px #2196f3)' : undefined,
                transition: 'filter 0.2s',
                pointerEvents: 'stroke',
                cursor: 'pointer',
              }}
              strokeDasharray={link.type === 'dashed' ? '8 4' : undefined}
              onMouseEnter={() => {
                if (typeof window !== 'undefined') {
                  (window as any).flowchartLinkHoverState?.[1](link.id);
                }
              }}
              onMouseLeave={() => {
                if (typeof window !== 'undefined') {
                  (window as any).flowchartLinkHoverState?.[1](null);
                }
              }}
            />
          );
        })}
  
        {nodes.map(node => {
          const pos = node.data.position || { x: 0, y: 0 };
          const size = node.data.size;
          return (
            <foreignObject
              key={node.id}
              x={pos.x}
              y={pos.y}
              width={size.width}
              height={size.height}
              style={{ overflow: 'visible', pointerEvents: 'auto', zIndex: 1 }}
            >
              {nodeRenderer(node)}
            </foreignObject>
          );
        })}

        {/* Render edge circles for each node */}
        {nodes.map(node => {
          const pos = node.data.position || { x: 0, y: 0 };
          const size = node.data.size;
          const top = FlowChartManager.getTopEdge(pos, size);
          const bottom = FlowChartManager.getBottomEdge(pos, size);
          const left = FlowChartManager.getLeftEdge(pos, size);
          const right = FlowChartManager.getRightEdge(pos, size);
          return (
            <g key={node.id + '-edge-circles'}>
              <circle cx={top.x} cy={top.y} r={3} fill="#333" stroke="#888" strokeWidth={2} />
              <circle cx={bottom.x} cy={bottom.y} r={3} fill="#333" stroke="#888" strokeWidth={2} />
              <circle cx={left.x} cy={left.y} r={3} fill="#333" stroke="#888" strokeWidth={2} />
              <circle cx={right.x} cy={right.y} r={3} fill="#333" stroke="#888" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
    );
  }

  // Returns the center of the top edge
  static getTopEdge(pos: { x: number; y: number }, size: { width: number; height: number }) {
    return { x: pos.x + size.width / 2, y: pos.y };
  }

  // Returns the center of the bottom edge
  static getBottomEdge(pos: { x: number; y: number }, size: { width: number; height: number }) {
    return { x: pos.x + size.width / 2, y: pos.y + size.height };
  }

  // Returns the center of the left edge
  static getLeftEdge(pos: { x: number; y: number }, size: { width: number; height: number }) {
    return { x: pos.x, y: pos.y + size.height / 2 };
  }

  // Returns the center of the right edge
  static getRightEdge(pos: { x: number; y: number }, size: { width: number; height: number }) {
    return { x: pos.x + size.width, y: pos.y + size.height / 2 };
  }
}
