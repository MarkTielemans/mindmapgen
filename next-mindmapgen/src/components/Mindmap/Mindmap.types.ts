import AbstractLayoutEngine from "./layout/AbstractLayoutEngine";

export interface MapNode {
    title: string;
    budget?: number;
    children?: MapNode[];
    slot?: Slot;
    anchorPointsIn?: Point[];
    anchorPointsOut?: Point[];
}

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    calculateDistance(p2: Point): number {
        const dx = p2.x - this.x;
        const dy = p2.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static add(p1: Point, p2: Point): Point {
        return new Point(p1.x + p2.x, p1.y + p2.y);
    }

    static subtract(p1: Point, p2: Point): Point {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }

    static multiply(p1: Point, scalar: number): Point {
        return new Point(p1.x * scalar, p1.y * scalar);
    }

    static normalize(p: Point): Point {
        const length = Math.sqrt(p.x * p.x + p.y * p.y);
        return length === 0 ? new Point(0, 0) : new Point(p.x / length, p.y / length);
    }

    static midpoint(p1: Point, p2: Point): Point {
        return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }

    static perpendicular(p: Point, clockwise: boolean = true): Point {
        return clockwise ? 
            new Point(-p.y, p.x) : 
            new Point(p.y, -p.x);
    }
}

export interface PointsPair {
    pointA: Point,
    pointB: Point,
    distance: number
}

export interface Slot {
    x: number,
    y: number,
    w: number,
    h: number,
}

export class Box {
    top: number = 0;
    left: number = 0;
    bottom: number = 0;
    right: number = 0;

    static fromSlot(slot: Slot): Box {
        const box = new Box();
        box.top = slot.y - slot.h / 2;
        box.left = slot.x - slot.w / 2;
        box.bottom = slot.y + slot.h / 2;
        box.right = slot.x + slot.w / 2;
        return box;
    }

    overlaps(other: Box): boolean {
        const xOverlap = this.left <= other.right && this.right >= other.left;
        const yOverlap = this.top <= other.bottom && this.bottom >= other.top;
        return xOverlap && yOverlap;
    }

    toString(): string {
        return `Box(top: ${this.top}, left: ${this.left}, bottom: ${this.bottom}, right: ${this.right})`;
    }

    closestTo(otherBox: Box): Point {
        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

        const x = clamp(
          otherBox.left > this.right ? this.right : (otherBox.right < this.left ? this.left : (Math.min(otherBox.left, this.left) + Math.max(otherBox.right, this.right)) / 2),
          this.left,
          this.right
        );
      
        const y = clamp(
          otherBox.top > this.bottom ? this.bottom : (otherBox.bottom < this.top ? this.top : (Math.min(otherBox.top, this.top) + Math.max(otherBox.bottom, this.bottom)) / 2),
          this.top,
          this.bottom
        );
      
        return new Point(x, y);
    }

    closestToPoint(point: Point): Point {
        const x = Math.max(this.left, Math.min(this.right, point.x));
        const y = Math.max(this.top, Math.min(this.bottom, point.y));
        return new Point(x, y);
    }

    width(): number {
        return this.right - this.left;
    }

    height(): number {
        return this.bottom - this.top;
    }

    center(): Point {
        return new Point((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    }
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
    onDataChange: (updatedData: MapNode) => void;
    LayoutEngine?: AbstractLayoutEngine;
    Renderer: React.ComponentType<RenderComponentProps & any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    renderConfig?: Record<string, unknown>;
}

export interface RenderComponentProps {
    data: MapNode;
    dimensions: Box;
    onDataChange: (updatedData: MapNode) => void;
}