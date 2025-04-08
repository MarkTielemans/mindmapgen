'use client';

import React, { useMemo } from 'react';
import { MapNode, MindmapProps, RenderComponentProps } from './Mindmap.types';
import HorizontalLayoutEngine from './layout/HorizontalLayoutEngine';

/**
 * @param data - The data to be rendered: input data.
 * @param onDataChange - The function to be called when the data changes.
 * @param LayoutEngine - The layout engine to be used.
 * @param Renderer - The renderer to be used.
 * @param renderConfig - The render config to be used.
 */
export default function Mindmap({ data, onDataChange, LayoutEngine = new HorizontalLayoutEngine(), Renderer, renderConfig }: MindmapProps) {
    const rendererProps = useMemo((): RenderComponentProps => {
        // Deep copy data
        const root = JSON.parse(JSON.stringify(data)) as MapNode;
        const { layoutData, dimensions } = LayoutEngine.doLayout(root);

        return {
            data: layoutData,
            dimensions,
            onDataChange: onDataChange
        };
    }, [data, onDataChange, LayoutEngine]);

    return (
        <Renderer {...rendererProps} {...renderConfig} />
    );
}