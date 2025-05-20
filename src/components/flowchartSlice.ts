import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FlowChartData, FlowChartNode, FlowChartLink } from './FlowChartData';

const initialState: FlowChartData = {
  nodes: [],
  links: [],
};

const flowchartSlice = createSlice({
  name: 'flowchart',
  initialState,
  reducers: {
    setFlowChartData(state, action: PayloadAction<FlowChartData>) {
      state.nodes = action.payload.nodes;
      state.links = action.payload.links;
    },
    setNodes(state, action: PayloadAction<FlowChartNode[]>) {
      state.nodes = action.payload;
    },
    setLinks(state, action: PayloadAction<FlowChartLink[]>) {
      state.links = action.payload;
    },
    updateNodePosition(state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) {
      const node = state.nodes.find(n => n.id === action.payload.id);
      if (node) node.data.position = action.payload.position;
    },
    // Add more reducers as needed (addNode, removeNode, etc)
  },
});

export const { setFlowChartData, setNodes, setLinks, updateNodePosition } = flowchartSlice.actions;
export default flowchartSlice.reducer;
