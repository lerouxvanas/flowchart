import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { FlowChartManager } from "./FlowChartManager";
import type { FlowChartNode, FlowChartLink } from "./FlowChartData";
import CustomNode, { type CustomNodeProps } from "./CustomNode";

const ChartContainer = styled.div`
  
`;

const initialNodes: FlowChartNode<CustomNodeProps>[] = [
  {
    id: "1",
    type: "input",
    component: CustomNode,
    data: { label: "Start", size: { width: 180, height: 40 }, position: { x: 100, y: 100 } },
  },
  {
    id: "2",
    type: "process",
    component: CustomNode,
    data: { label: "Process", size: { width: 180, height: 40 }, position: { x: 300, y: 100 } },
  },
  {
    id: "3",
    type: "output",
    component: CustomNode,
    data: { label: "End", size: { width: 180, height: 40 }, position: { x: 500, y: 100 } },
  },
  {
    id: "4",
    type: "process",
    component: CustomNode,
    data: { label: "Step Two", size: { width: 180, height: 40 }, position: { x: 500, y: 300 } },
  },
];
const sampleLinks: FlowChartLink[] = [
  {
    id: "l1",
    source: "1",
    target: "2",
    type: "default",
    style: { stroke: "#888", strokeWidth: 2 },
    markerEnd: { type: "arrow" },
    data: { label: "" },
  },
  {
    id: "l2",
    source: "2",
    target: "3",
    type: "default",
    style: { stroke: "#888", strokeWidth: 2 },
    markerEnd: { type: "arrow" },
    data: { label: "" },
  },
  {
    id: "l3",
    source: "2",
    target: "4",
    type: "default",
    style: { stroke: "#888", strokeWidth: 2 },
    markerEnd: { type: "arrow" },
    data: { label: "" },
  },
];

interface FlowChartProps {
  lineStyle?: React.CSSProperties;
}

const FlowChart: React.FC<FlowChartProps> = ({ lineStyle }) => {
  // Node positions in state for drag
  const [nodes, setNodes] = useState<FlowChartNode[]>(initialNodes);
  const [dragging, setDragging] = useState<null | { id: string; offsetX: number; offsetY: number }>();

  // Update manager with current node positions
  const manager = React.useMemo(() => {
    const m = new FlowChartManager();
    nodes.forEach((node) => m.addNode(node));
    sampleLinks.forEach((link) => m.addLink(link));
    return m;
  }, [nodes]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent, node: FlowChartNode) => {
    const pos = node.data.position || { x: 0, y: 0 };
    setDragging({
      id: node.id,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    });
    e.stopPropagation();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id === dragging.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  position: {
                    x: e.clientX - dragging.offsetX,
                    y: e.clientY - dragging.offsetY,
                  },
                },
              };
            }
            return node;
          })
        );
      }
    },
    [dragging]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Attach global mousemove/mouseup listeners when dragging
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const nodeRenderer = (node: FlowChartNode) => (
    <div
      style={{ cursor: "move", userSelect: "none", width: node.data.size.width, height: node.data.size.height }}
      onMouseDown={e => handleMouseDown(e, node)}
    >
      <CustomNode label={node.data.label} color={node.id === "1" ? "#4caf50" : node.id === "3" ? "#f44336" : undefined} />
    </div>
  );

  return (
    <ChartContainer>
      {manager.drawFlowChart(nodeRenderer, lineStyle)}
    </ChartContainer>
  );
};

export default FlowChart;
