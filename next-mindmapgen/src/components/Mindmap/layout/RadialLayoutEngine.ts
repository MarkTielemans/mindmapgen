import { Box, MapNode, Point } from "../Mindmap.types";
import AbstractLayoutEngine, { LayoutEngineConfig } from "./AbstractLayoutEngine";

export interface RadialLayoutConfig extends LayoutEngineConfig {
    radius: number;
    radiusStep: number;
    maxRadius: number;
}

class RadialLayoutEngine extends AbstractLayoutEngine {
    protected override config: RadialLayoutConfig;

    constructor(config: Partial<RadialLayoutConfig> = {}) {
        const c = {
            nodeX: 200,
            nodeY: 70,
            radius: 100,
            radiusStep: 10,
            maxRadius: 100 + 10 * 10,
            ...config
        } as RadialLayoutConfig;
        super(c);
        this.config = c;
    }

    doLayout(data: MapNode): { layoutData: MapNode; dimensions: Box; } {
        if (!data.children) {
            return {
                layoutData: data,
                dimensions: new Box()
            }
        }

        data.slot = this.createSlot(0, 0);
        this.updateDimensionBoundaries(data.slot);
        
        const angleStep = (2 * Math.PI) / data.children.length;
        
        // Calculate minimum radius needed to prevent overlaps
        // For a regular polygon, the minimum radius is:
        // r = (s + d) / (2 * sin(π/n)) where s is the side length and d is the node dimension
        const minNodeDimension = Math.max(this.config.nodeX, this.config.nodeY);
        const minRadius = (minNodeDimension * 1.5) / (2 * Math.sin(Math.PI / data.children.length));
        let radius = Math.max(this.config.radius, minRadius);
        radiusStep: while (true) {
            const boxes = [ Box.fromSlot(data.slot) ];
            for (let i = 0; i < data.children.length; i++) {
                const child = data.children[i];
                const angle = i * angleStep;
                
                const x = radius * Math.sin(angle);
                const y = radius * Math.cos(angle);
                child.slot = this.createSlot(x, y);
                child.anchorPointsIn = [];
                child.anchorPointsOut = [];
                // TODO no L2 support
                child.children = [];
                this.addAnchorPoints(data, child);
                this.updateDimensionBoundaries(child.slot);

                const box = Box.fromSlot(child.slot);
                for (let j = 0; j < boxes.length; j++) {
                    const otherBox = boxes[j];
                    if (box.overlaps(otherBox)) {
                        radius += this.config.radiusStep;
                        if (radius > this.config.maxRadius) {
                            throw new Error('Max radius reached');
                        }
                        continue radiusStep;
                    }
                }

                boxes.push(box);
            }
            break;
        }

        // Add all anchor points
        data.anchorPointsOut = [
            this.topLeftFor(data.slot),
            this.topMidFor(data.slot),
            this.topRightFor(data.slot),
            this.midRightFor(data.slot),
            this.bottomRightFor(data.slot),
            this.bottomMidFor(data.slot),
            this.bottomLeftFor(data.slot),
            this.midLeftFor(data.slot),
        ];

        const result = {
            layoutData: data,
            dimensions: this.dimensions
        };

        return result;
    }

    addAnchorPoints(parent: MapNode, node: MapNode) {
        if (!parent.slot || !node.slot) {
            throw new Error('Slot is required');
        }
        
        const goingLeft = parent.slot.x > node.slot.x;
        const goingDown = parent.slot.y < node.slot.y;

        if (goingLeft && goingDown) {
            node.anchorPointsIn = [ this.topRightFor(node.slot), this.midRightFor(node.slot), this.bottomRightFor(node.slot), this.topMidFor(node.slot), this.topLeftFor(node.slot) ];
            node.anchorPointsOut = [ this.bottomLeftFor(node.slot), this.bottomMidFor(node.slot), this.bottomRightFor(node.slot), this.midLeftFor(node.slot), this.topLeftFor(node.slot) ];
        } else if (goingLeft && !goingDown) {
            node.anchorPointsIn = [ this.bottomRightFor(node.slot), this.midRightFor(node.slot), this.topRightFor(node.slot), this.bottomMidFor(node.slot), this.bottomLeftFor(node.slot) ];
            node.anchorPointsOut = [ this.topLeftFor(node.slot), this.midLeftFor(node.slot), this.topMidFor(node.slot) ];
        } else if (!goingLeft && goingDown) {
            node.anchorPointsIn = [ this.topLeftFor(node.slot), this.midLeftFor(node.slot), this.topMidFor(node.slot), this.topRightFor(node.slot), this.bottomLeftFor(node.slot) ];
            node.anchorPointsOut = [ this.bottomRightFor(node.slot), this.midRightFor(node.slot), this.topRightFor(node.slot), this.bottomMidFor(node.slot), this.bottomLeftFor(node.slot) ];
        } else {
            node.anchorPointsIn = [ this.bottomLeftFor(node.slot), this.midLeftFor(node.slot), this.topLeftFor(node.slot), this.bottomMidFor(node.slot), this.bottomRightFor(node.slot) ];
            node.anchorPointsOut = [ this.topRightFor(node.slot), this.midRightFor(node.slot), this.topMidFor(node.slot), this.topLeftFor(node.slot), this.bottomLeftFor(node.slot) ];
        }
    }

    closestPoint(box: Box, points: Point[]): Point {
        return points.reduce((closest, point) => {
            // Find the closest point on the box to the current point
            const boxX = Math.max(box.left, Math.min(point.x, box.right));
            const boxY = Math.max(box.top, Math.min(point.y, box.bottom));
            
            const distance = Math.sqrt(
                Math.pow(point.x - boxX, 2) + 
                Math.pow(point.y - boxY, 2)
            );
            return distance < closest.distance ? { point, distance } : closest;
        }, { point: points[0], distance: Infinity }).point;
    }
}

export default RadialLayoutEngine;