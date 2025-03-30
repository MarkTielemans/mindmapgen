'use client';

import React, { JSX, useEffect, useState } from "react";
import { MapNode, RenderComponentProps, Slot } from "../Mindmap.types";
import {Tooltip} from "@heroui/react";
import styles from './SvgMindmapView.module.css';

export interface SvgMindmapProps extends RenderComponentProps {
    showToolTip: boolean,
    showToolbar: boolean,
    arrowColor: string,
    arrowCurveExclFactor: number,
    width?: string,
    height?: string
}

export default function SvgMindmapView({ data, onDataChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    showToolTip = true, 
    showToolbar = true, 
    arrowColor = '#000', 
    arrowCurveExclFactor = 0.3,
    width = '100%',
    height = '100%'
}: SvgMindmapProps) {

    if (!data.dimensions) {
        throw new Error('Dimensions are required');
    }

    const topLeftFor = (slot: Slot): Slot => {
        return { ...slot, x: slot.x - (slot.w / 2), y: slot.y - (slot.h / 2) };
    }

    const midRightFor = (slot: Slot): Slot => {
        return { ...slot, x: slot.x + (slot.w / 2) };
    }

    const midLeftFor = (slot: Slot): Slot => {
        return { ...slot, x: slot.x - (slot.w / 2) };
    }

    const getRect = (node: MapNode): JSX.Element => {
        if (!node.slot) {
            throw new Error('Slot is required');
        }

        const normalizedSlot = topLeftFor(node.slot);

        return (
            <foreignObject x={normalizedSlot.x} y={normalizedSlot.y} width={normalizedSlot.w} height={normalizedSlot.h} style={{ overflow: 'visible' }}>
              <div style={{ width: '100%', height: `${normalizedSlot.h}px`, position: 'relative' }}>
                <div className={styles.foreignDiv}>
                  <div className={styles.content} style={{ height: `${normalizedSlot.h}px` }}>
                    <div className={styles.contentText}>
                      {showToolTip ? (
                        <Tooltip content={node.title}>
                          {node.title}
                        </Tooltip>
                      ) : (
                        node.title
                      )}
                    </div>
                  </div>
                  {showToolbar && (
                    <div className={styles.controlBar}>
                      <button className={styles.controlButton}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                      <div className={styles.spacer}></div>
                      <button className={styles.controlButton}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <input type="text" defaultValue="$1000" className={styles.controlBarInput} />
                      <button className={styles.controlButton}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </foreignObject>
          );
    }

    const getArrows = (from: Slot, to: Slot): JSX.Element => {
        const fromX = from.x;
        const fromY = from.y;
        const toX = to.x;
        const toY = to.y;

        const totalDistance = Math.abs(toX - fromX);
        let straightLength = totalDistance * arrowCurveExclFactor;
    
        // For arrows going left
        if (fromX > toX) {
          straightLength = -straightLength;
        }
    
        // For S-curve, use two control points
        const startX = fromX;
        const startY = fromY;
        const straightStartX = fromX + straightLength;
        const straightStartY = fromY;
        const straightEndX = toX - straightLength;
        const straightEndY = toY;
        const endX = toX;
        const endY = toY;
        
        // Calculate path
        const path = fromY === toY 
        ? `M ${startX} ${startY} L ${endX} ${endY}`  // Straight line if Y's match
        : `M ${startX} ${startY}
           L ${straightStartX} ${straightStartY}
           C ${straightStartX + straightLength} ${straightStartY}, 
             ${straightEndX - straightLength} ${straightEndY}, 
             ${straightEndX} ${straightEndY}
           L ${endX} ${endY}`;
      
        // Create arrowhead
        const arrowSize = 8;
        const arrowhead = toX < fromX
        ? `M ${toX + arrowSize} ${toY - arrowSize}
          L ${toX} ${toY}
          L ${toX + arrowSize} ${toY + arrowSize}`
        : `M ${toX - arrowSize} ${toY - arrowSize}
          L ${toX} ${toY}
          L ${toX - arrowSize} ${toY + arrowSize}`;
      
        return (
            <>
                <path d={path} fill="none" stroke={arrowColor} strokeWidth={2} />
                <path d={arrowhead} fill="none" stroke={arrowColor} strokeWidth={2} />
                <circle cx={fromX} cy={fromY} r="4" fill="white" stroke={arrowColor} strokeWidth={2} />
            </>
        );
    }

    const renderNode = (node: MapNode): JSX.Element => {
        if (!node.slot) {
            throw new Error('Slot is required');
        }

        return (
            <React.Fragment key={node.slot.x + 'x' + node.slot.y}>
                {getRect(node)}
                {node.children?.map(child => {
                    if (!node?.slot || !child?.slot) {
                        console.error('Child slot is required');
                        return null;
                    }

                    let arrowStart = null;
                    let arrowEnd = null;
                    if (node.slot.x > child.slot.x) {
                      arrowStart = midLeftFor(node.slot);
                      arrowEnd = midRightFor(child.slot);
                    } else {
                      arrowStart = midRightFor(node.slot);
                      arrowEnd = midLeftFor(child.slot);
                    }
              
                    return (
                        <React.Fragment key={child.slot.x + 'x' + child.slot.y}>
                            {renderNode(child)}
                            {getArrows(arrowStart, arrowEnd)}
                        </React.Fragment>
                    );
                })}
            </React.Fragment>
        );
    };

    const [clientData, setClientData] = useState<typeof data | null>(null);

    useEffect(() => {
        setClientData(data);
    }, [data]);

    if (!clientData) return null;

    return (
        <svg id="mindmap" style={{width: width, height: height}} viewBox={`${data.dimensions.xMin} ${data.dimensions.yMin} ${data.dimensions.xMax - data.dimensions.xMin} ${data.dimensions.yMax - data.dimensions.yMin}`}>
            {renderNode(clientData)}
        </svg>
    );
}
