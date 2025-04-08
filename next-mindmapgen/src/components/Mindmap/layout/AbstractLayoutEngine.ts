import { WeightedNode, MapNode, Slot, Point, Box } from "../Mindmap.types";

export interface LayoutEngineConfig {
    nodeX: number,
    nodeY: number
}

abstract class AbstractLayoutEngine {
    protected dimensions: Box = new Box();
    protected config: LayoutEngineConfig;

    constructor(config: LayoutEngineConfig) {
        this.config = config;
    }

    abstract doLayout(data: MapNode): { layoutData: MapNode, dimensions: Box };

    createSlot(x: number, y: number, w: number = this.config.nodeX, h: number = this.config.nodeY): Slot {
        return { x, y, w, h };
    };

    weigh(node: MapNode): WeightedNode {
        return {
            ...node,
            weight: Math.max(1, node.children?.length || 0)
        };
    }

    updateDimensionBoundaries(slot: Slot) {
        this.dimensions.left = Math.min(this.dimensions.left, slot.x - slot.w / 2);
        this.dimensions.right = Math.max(this.dimensions.right, slot.x + slot.w / 2);
        this.dimensions.top = Math.min(this.dimensions.top, slot.y - slot.h / 2);
        this.dimensions.bottom = Math.max(this.dimensions.bottom, slot.y + slot.h / 2);
    }

    midRightFor(slot: Slot): Point {
        return new Point(Box.fromSlot(slot).right, slot.y);
    }

    midLeftFor(slot: Slot): Point {
        return new Point(Box.fromSlot(slot).left, slot.y);
    }

    topMidFor(slot: Slot): Point {
        return new Point(slot.x, Box.fromSlot(slot).top);
    }

    bottomMidFor(slot: Slot): Point {
        return new Point(slot.x, Box.fromSlot(slot).bottom);
    }

    topLeftFor(slot: Slot): Point {
        return new Point(Box.fromSlot(slot).left, Box.fromSlot(slot).top);
    }

    topRightFor(slot: Slot): Point {
        return new Point(Box.fromSlot(slot).right, Box.fromSlot(slot).top);
    }

    bottomLeftFor(slot: Slot): Point {
        return new Point(Box.fromSlot(slot).left, Box.fromSlot(slot).bottom);
    }

    bottomRightFor(slot: Slot): Point {
        return new Point(Box.fromSlot(slot).right, Box.fromSlot(slot).bottom);
    }
}

export default AbstractLayoutEngine;