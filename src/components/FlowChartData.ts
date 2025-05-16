export interface FlowChartData {
    nodes: FlowChartNode[];
    links: FlowChartLink[];
};

export interface FlowChartNode<T = unknown> {
    id: string;
    type: NodeType;
    component: React.FC<T>;
    data: {
      label: string;
      size: { width: number, height: number };
      position?: { x: number; y: number };
      props?: T;
    };
}
  
export interface FlowChartLink<T = unknown> {
    id: string;
    source: string;
    target: string;
    type: LinkType;
    style: React.CSSProperties;
    markerEnd?: {
        type: LineEndType;
    };
    data: {
        label: string;
        props?: T;
    };
}

type NodeType = 'input' | 'process' | 'decision' | 'output';
type LinkType = 'default' | 'dashed' | 'highlighted';
type LineEndType = 'arrow' | 'circle' | 'square';