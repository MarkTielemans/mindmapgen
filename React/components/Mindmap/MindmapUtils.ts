import { BalanceResult, WeightedNode, MapNode, Slot, Dimensions } from "./Mindmap.types";

export const conf = { // TODO: Make this configurable
    nodeX: 200,
    spaceX: 100,
    nodeY: 70,
    spaceY: 25,
    spaceOut: false
};

export function createSlot(x: number, y: number, w = conf.nodeX, h = conf.nodeY): Slot {
    return { x, y, w, h };
};

export function weigh(node: MapNode): WeightedNode {
    return {
        ...node,
        weight: Math.max(1, node.children?.length || 0)
    };
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
export function balance(data: MapNode): BalanceResult {
    const nodes = data?.children;

    if (!nodes) {
        return {
            right: [],
            left: [],
        } as BalanceResult;
    }

    if (nodes.length === 1) {
        return {
            right: [weigh(nodes[0])],
            left: []
        } as BalanceResult;
    };

    // Sort nodes by weight (descending)
    const sorted = [...nodes].sort((a, b) => weigh(b).weight - weigh(a).weight);

    // Initialize sides with first two nodes
    const sides: BalanceResult = {
        right: [weigh(sorted[0])],
        left: [weigh(sorted[1])]
    };
    sides.rightWeight = sides.right[0].weight;
    sides.leftWeight = sides.left[0].weight;

    // Distribute remaining nodes to balance the sides
    for (let i = 2; i < sorted.length; i++) {
        const currentNode = weigh(sorted[i]);

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
export function getChildSlots(amount: number, parentSlot: Slot, left: boolean = false): Slot[] {
    const sign = left ? -1 : 1;
    const slots: Slot[] = [];

    if (amount < 1) {
      return slots;
    }

    /* Positions are from center of the node to avoid differences in left and right logic */
    const slot = createSlot(parentSlot.x, parentSlot.y);
    // For X: move half of parent and half of own and spaceX constant to X of parent
    // Math.abs is to avoid negative * negative with sign
    const xdelta = (sign * Math.abs(parentSlot.w / 2 + slot.w / 2 + conf.spaceX));
    slot.x += xdelta;

    if (amount === 1) {
        // Unique case because y remains as-is
      slots.push(slot);
    } else {
      // Negative Y is up to conform with SVG Canvas Y-axis
      // Move up by half of the total height of child slots and their spacing
      // Then move back half of height to reach center of starting slot
      const totalHeight = (amount * slot.h) + ((amount - 1) * conf.spaceY);
      const startY = (parentSlot.y - (totalHeight / 2)) + slot.h / 2;

      for (let i = 0; i < amount; i++) {
        // Move down by the height of the child slots and their spacing
        const s = { ...slot };
        s.y = startY + (i * (conf.spaceY + slot.h));
        slots.push(s);
      }
    }
    return slots;
}

export function updateDimensionBoundaries(dimensions: Dimensions, slot: Slot) {
    dimensions.xMin = Math.min(dimensions.xMin, slot.x - slot.w / 2);
    dimensions.xMax = Math.max(dimensions.xMax, slot.x + slot.w / 2);
    dimensions.yMin = Math.min(dimensions.yMin, slot.y - slot.h / 2);
    dimensions.yMax = Math.max(dimensions.yMax, slot.y + slot.h / 2);
}

export function distributeSide(_nodes: WeightedNode[], parent: MapNode, left: boolean = false) {
    if (!parent.slot) {
        parent.slot = createSlot(0, 0);
    }

    if (!parent.children) {
        parent.children = [];
    }

    if (!parent.dimensions) {
        parent.dimensions = {
            xMin: 0,
            yMin: 0,
            xMax: 0,
            yMax: 0
        };
    }

    // Calculate total weight of this side
    // Add 1 for each node to account for spacing between branches
    const totalWeight = _nodes.reduce((acc, node) => acc + node.weight, 0) + (conf.spaceOut ? _nodes.length - 1 : 0);

    // Slots are evenly (y axis) distributed coordinate sets relative to the parent node
    const slots = getChildSlots(totalWeight, parent.slot, left);
    let slotIndex = 0;

    // Consume weight in slots per node
    // This way, each first-depth slot gets the space reservation of its' total weight
    for (let i = 0; i < _nodes.length; i++) {
      // Consume slots to satisfy the node's weight
      const node = _nodes[i];
      const slotIndexAfter = slotIndex + node.weight + (conf.spaceOut ? 1 : 0);
      const nodeSlots = slots.slice(slotIndex, slotIndexAfter);
      slotIndex = slotIndexAfter;

      // Create a new slot in the center of the reserved space for the node itself
      const minY = nodeSlots[0].y;
      const maxY = nodeSlots[nodeSlots.length - 1].y;
      node.slot = createSlot(nodeSlots[0].x, (minY + maxY) / 2);
      updateDimensionBoundaries(parent.dimensions, node.slot);

      if (node.children) {
        // Get new child slots relative to the node's slot
        const childSlots = getChildSlots(node.children.length, node.slot, left);

        for (let z = 0; z < node.children.length; z++) {
            const cSlot = childSlots[z];
            node.children[z].slot = cSlot;
            updateDimensionBoundaries(parent.dimensions, cSlot);
        }
      }

      parent.children.push(node);
    }
}