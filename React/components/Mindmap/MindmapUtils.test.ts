import { describe, it, expect } from "vitest";
import { createSlot, getChildSlots, conf } from "./MindmapUtils";
import { Slot } from "./Mindmap.types";

const calcYDelta = (amount: number, nodeY: number, spaceY: number): number => {
    const verticalSpace = (amount * nodeY) + ((amount - 1) * spaceY);
    return (verticalSpace / 2) - (nodeY / 2);
}

describe("getChildSlots", () => {
    it("should return an empty array when requesting 0 slots", () => {
        const parentSlot: Slot = createSlot(0, 0);
        expect(getChildSlots(0, parentSlot)).toEqual([]);
    });

    it("should position a single child correctly (Right)", () => {
        const parentSlot: Slot = createSlot(0, 0);
        const slots = getChildSlots(1, parentSlot);
        expect(slots.length).toBe(1);
        expect(slots[0].x).toBe(conf.nodeX + conf.spaceX); // Ensure it moves to the right
    });

    it("should position a single child correctly (Left)", () => {
        const parentSlot: Slot = createSlot(0, 0);
        const slots = getChildSlots(1, parentSlot, true);
        expect(slots.length).toBe(1);
        expect(slots[0].x).toBe(-1 * (conf.nodeX + conf.spaceX)); // Ensure it moves to the right
    });

    it("should position two children correctly (Right)", () => {
        const parentSlot: Slot = createSlot(0, 0);
        const slots = getChildSlots(2, parentSlot);
        expect(slots.length).toBe(2);
        expect(slots[1].x).not.toBe(parentSlot.x);
        expect(slots[1].y).not.toBe(parentSlot.y);
        expect(slots[1].y).not.toBe(slots[0].y);

        expect(slots[0].x).toBe(conf.nodeX + conf.spaceX);
        expect(slots[1].x).toBe(conf.nodeX + conf.spaceX);
        const yDelta = calcYDelta(2, conf.nodeY, conf.spaceY);
        expect(slots[0].y).toBe(0 - yDelta);
        expect(slots[1].y).toBe(yDelta);
    });

    it("should position two children correctly (Left)", () => {
        const parentSlot: Slot = createSlot(0, 0);
        const slots = getChildSlots(2, parentSlot, true);
        expect(slots.length).toBe(2);
        expect(slots[1].x).not.toBe(parentSlot.x);
        expect(slots[1].y).not.toBe(parentSlot.y);
        expect(slots[1].y).not.toBe(slots[0].y);

        expect(slots[0].x).toBe(-1 * (conf.nodeX + conf.spaceX));
        expect(slots[1].x).toBe(-1 * (conf.nodeX + conf.spaceX));
        const yDelta = calcYDelta(2, conf.nodeY, conf.spaceY);
        expect(slots[0].y).toBe(0 - yDelta);
        expect(slots[1].y).toBe(yDelta);
    });
});
