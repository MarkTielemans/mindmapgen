'use client';

import React, { useMemo } from 'react';
import { MindmapProps, RenderComponentProps } from './Mindmap.types';
import { balance, distributeSide } from './MindmapUtils';
/**
 * @param data - The data to be rendered: input data.
 * @param onDataChange - The function to be called when the data changes.
 * @param Renderer - The renderer to be used.
 * @param renderConfig - The render config to be used.
 */
export default function Mindmap({ data, onDataChange, Renderer, renderConfig }: MindmapProps) {
    const rendererProps = useMemo((): RenderComponentProps => {
        // Deep copy data
        const root = JSON.parse(JSON.stringify(data));
        const { left, right } = balance(root);
        root.children = null;
        distributeSide(left, root, true);
        distributeSide(right, root, false);

        return {
            data: root,
            onDataChange: onDataChange
        };
    }, [data, onDataChange]);

    return (
        <Renderer {...rendererProps} {...renderConfig} />
    );
}