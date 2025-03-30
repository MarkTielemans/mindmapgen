export interface Dimensions {
    xMin: number,
    yMin: number,
    xMax: number,
    yMax: number,
}

export interface MapNode {
    title: string;
    budget?: number;
    children?: MapNode[];
    slot?: Slot;
    dimensions?: Dimensions;
}

export interface Slot {
    x: number,
    y: number,
    w: number,
    h: number,
}

export interface BalanceResult {
    right: WeightedNode[],
    left: WeightedNode[],
    rightWeight?: number,
    leftWeight?: number
}

export interface WeightedNode extends MapNode {
    weight: number
}

export interface MindmapProps {
    data: MapNode;
    onDataChange: (updatedData: MapNode) => void
    Renderer: React.ComponentType<RenderComponentProps & any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    renderConfig?: Record<string, unknown>;
}

export interface RenderComponentProps {
    data: MapNode;
    onDataChange: (updatedData: MapNode) => void;
}