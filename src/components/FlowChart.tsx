import React, { useCallback } from "react";
import styled from "styled-components";
import { FlowChartManager } from "./FlowChartManager";
import type { FlowChartNode, FlowChartLink } from "./FlowChartData";
import CustomNode, { type CustomNodeProps } from "./CustomNode";
import { FlowChartProvider, useFlowChartContext } from "./FlowChartContext";

const ChartContainer = styled.div`
  
`;

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
    style: { stroke: "#888", strokeWidth: 2, strokeDasharray: "5, 5" },
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
  {
    id: "l4",
    source: "2",
    target: "5",
    type: "default",
    style: { stroke: "red", strokeWidth: 2 },
    markerEnd: { type: "arrow" },
    data: { label: "" },
  },
  {
    id: "l5",
    source: "5",
    target: "3",
    type: "default",
    style: { stroke: "blue", strokeWidth: 2 },
    markerEnd: { type: "circle" },
    data: { label: "" },
  },
];

interface FlowChartProps {
  lineStyle?: React.CSSProperties;
}

const FlowChart: React.FC<FlowChartProps> = ({ lineStyle }) => {
  const { nodes, setNodes, dragging, setDragging } = useFlowChartContext();

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
    [dragging, setNodes]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, [setDragging]);

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

// Export wrapped with provider for easy usage
const FlowChartWithProvider: React.FC<FlowChartProps> = (props) => (
  <FlowChartProvider>
    <FlowChart {...props} />
  </FlowChartProvider>
);

export default FlowChartWithProvider;
