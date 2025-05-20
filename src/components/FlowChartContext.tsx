import React, { createContext, useContext, useState, useCallback } from "react";
import type { FlowChartNode, FlowChartLink } from "./FlowChartData";
import CustomNode, { type CustomNodeProps } from "./CustomNode";

// Initial nodes and links (copied from FlowChart.tsx for context)
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
  {
    id: "5",
    type: "process",
    component: CustomNode,
    data: { label: "Step Two", size: { width: 180, height: 40 }, position: { x: 500, y: 500 } },
  },
];

interface DraggingState {
  id: string;
  offsetX: number;
  offsetY: number;
}

interface FlowChartContextType {
  nodes: FlowChartNode[];
  setNodes: React.Dispatch<React.SetStateAction<FlowChartNode[]>>;
  dragging: DraggingState | null;
  setDragging: React.Dispatch<React.SetStateAction<DraggingState | null>>;
}

const FlowChartContext = createContext<FlowChartContextType | undefined>(undefined);

export const useFlowChartContext = () => {
  const ctx = useContext(FlowChartContext);
  if (!ctx) throw new Error("useFlowChartContext must be used within FlowChartProvider");
  return ctx;
};

export const FlowChartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<FlowChartNode[]>(initialNodes);
  const [dragging, setDragging] = useState<DraggingState | null>(null);

  return (
    <FlowChartContext.Provider value={{ nodes, setNodes, dragging, setDragging }}>
      {children}
    </FlowChartContext.Provider>
  );
};
