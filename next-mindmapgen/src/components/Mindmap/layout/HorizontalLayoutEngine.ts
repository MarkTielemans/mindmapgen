import { BalanceResult, Box, MapNode, Slot, WeightedNode } from "../Mindmap.types";
import AbstractLayoutEngine, { LayoutEngineConfig } from "./AbstractLayoutEngine";

export interface HorizontalLayoutConfig extends LayoutEngineConfig {
    spaceX: number,
    spaceY: number,
    spaceOut: boolean
};

/**
 * Layout engine for horizontal layout.
 */
class HorizontalLayoutEngine extends AbstractLayoutEngine {
    protected override config: HorizontalLayoutConfig;

    constructor(config: Partial<HorizontalLayoutConfig> = {}) {
        const c = {
            nodeX: 200,
            nodeY: 70,
            spaceX: 100,
            spaceY: 25,
            spaceOut: false, // TODO bug in spaceout in even amount of elements
            ...config
        } as HorizontalLayoutConfig;
        super(c);
        this.config = c;
    }

    doLayout(data: MapNode): { layoutData: MapNode, dimensions: Box } {
        const { left, right } = this.balance(data);
        data.children = [];
        this.distributeSide(left, data, true);
        this.distributeSide(right, data, false);
        if (data.slot) {
            data.anchorPointsOut = [ this.midRightFor(data.slot), this.midLeftFor(data.slot) ];
        }
        
        return { layoutData: data, dimensions: this.dimensions };
    }

    /**
     * Balances the nodes on the left and right sides of the mindmap:
     * 1. Sort the nodes by weight (amount of children) descending.
     * 2. Initialize the sides with the two heaviest nodes.
     * 3. Distribute the remaining nodes to balance the sides, adding each to the lightest side.
     * 
     * When calculating weight, min value is 1, 1 child is still 1 (vertical space use).
     * 
     * @param data - The data to be rendered: input data.
     * @returns The balanced nodes.
     */
    balance(data: MapNode): BalanceResult {
        const nodes = data?.children;

        if (!nodes) {
            return {
                right: [],
                left: [],
            } as BalanceResult;
        }

        if (nodes.length === 1) {
            return {
                right: [this.weigh(nodes[0])],
                left: []
            } as BalanceResult;
        };

        // Sort nodes by weight (descending)
        const sorted = [...nodes].sort((a, b) => this.weigh(b).weight - this.weigh(a).weight);

        // Initialize sides with first two nodes
        const sides: BalanceResult = {
            right: [this.weigh(sorted[0])],
            left: [this.weigh(sorted[1])]
        };
        sides.rightWeight = sides.right[0].weight;
        sides.leftWeight = sides.left[0].weight;

        // Distribute remaining nodes to balance the sides
        for (let i = 2; i < sorted.length; i++) {
            const currentNode = this.weigh(sorted[i]);

            if (sides.rightWeight <= sides.leftWeight) {
                sides.right.push(currentNode);
                sides.rightWeight += currentNode.weight;
            } else {
                sides.left.push(currentNode);
                sides.leftWeight += currentNode.weight;
            }
        }

        return sides;
    }

    /**
     * Returns the child slots for a given parent slot and amount of children.
     * Child slots are positioned outward to the side of the parent and are centered vertically relative to the parent.
     * 
     * @param amount - The amount of children.
     * @param parentSlot
     * @param left - Whether the children are on the left side.
     * @returns The child slots.
     */
    getChildSlots(amount: number, parentSlot: Slot, left: boolean = false): Slot[] {
        const sign = left ? -1 : 1;
        const slots: Slot[] = [];

        if (amount < 1) {
            return slots;
        }

        /* Positions are from center of the node to avoid differences in left and right logic */
        const slot = this.createSlot(parentSlot.x, parentSlot.y);
        // For X: move half of parent and half of own and spaceX constant to X of parent
        // Math.abs is to avoid negative * negative with sign
        const xdelta = (sign * Math.abs(parentSlot.w / 2 + slot.w / 2 + this.config.spaceX));
        slot.x += xdelta;

        if (amount === 1) {
            // Unique case because y remains as-is
            slots.push(slot);
        } else {
            // Negative Y is up to conform with SVG Canvas Y-axis
            // Move up by half of the total height of child slots and their spacing
            // Then move back half of height to reach center of starting slot
            const totalHeight = (amount * slot.h) + ((amount - 1) * this.config.spaceY);
            const startY = (parentSlot.y - (totalHeight / 2)) + slot.h / 2;

            for (let i = 0; i < amount; i++) {
                // Move down by the height of the child slots and their spacing
                const s = { ...slot };
                s.y = startY + (i * (this.config.spaceY + slot.h));
                slots.push(s);
            }
        }
        return slots;
    }

    distributeSide(_nodes: WeightedNode[], parent: MapNode, left: boolean = false) {
        if (!parent.slot) {
            parent.slot = this.createSlot(0, 0);
        }

        if (!parent.children) {
            parent.children = [];
        }

        // Calculate total weight of this side
        // Add 1 for each node to account for spacing between branches
        const totalWeight = _nodes.reduce((acc, node) => acc + node.weight, 0) + (this.config.spaceOut ? _nodes.length - 1 : 0);

        // Slots are evenly (y axis) distributed coordinate sets relative to the parent node
        const slots = this.getChildSlots(totalWeight, parent.slot, left);
        let slotIndex = 0;

        // Consume weight in slots per node
        // This way, each first-depth slot gets the space reservation of its' total weight
        for (let i = 0; i < _nodes.length; i++) {
            // Consume slots to satisfy the node's weight
            const node = _nodes[i];
            const slotIndexAfter = slotIndex + node.weight + (this.config.spaceOut ? 1 : 0);
            const nodeSlots = slots.slice(slotIndex, slotIndexAfter);
            slotIndex = slotIndexAfter;

            // Create a new slot in the center of the reserved space for the node itself
            const minY = nodeSlots[0].y;
            const maxY = nodeSlots[nodeSlots.length - 1].y;
            node.slot = this.createSlot(nodeSlots[0].x, (minY + maxY) / 2);
            this.addAnchorPoints(node, left);
            this.updateDimensionBoundaries(node.slot);

            if (node.children) {
                // Get new child slots relative to the node's slot
                const childSlots = this.getChildSlots(node.children.length, node.slot, left);

                for (let z = 0; z < node.children.length; z++) {
                    const cSlot = childSlots[z];
                    node.children[z].slot = cSlot;
                    this.addAnchorPoints(node.children[z], left);
                    this.updateDimensionBoundaries(cSlot);
                }
            }

            parent.children.push(node);
        }
    }

    addAnchorPoints(node: MapNode, left: boolean = false) {
        if (!node.slot) {
            throw new Error('Slot is required');
        }

        if (left) {
            node.anchorPointsIn = [ this.midRightFor(node.slot) ];
            node.anchorPointsOut = [ this.midLeftFor(node.slot) ];
        } else {
            node.anchorPointsIn = [ this.midLeftFor(node.slot) ];
            node.anchorPointsOut = [ this.midRightFor(node.slot) ];
        }
    }
    getConfig(): Readonly<HorizontalLayoutConfig> {
        return Object.freeze({ ...this.config });
    }
}

export default HorizontalLayoutEngine;