'use client';

import React, { JSX, useEffect, useState } from "react";
import { Box, MapNode, Point, RenderComponentProps, Slot } from "../Mindmap.types";
import { calculateArcControlPoint, closestPoint, closestPoints } from "./RenderUtils";
import styles from './SvgMindmapView.module.css';

export interface SvgMindmapProps extends RenderComponentProps {
    showToolTip: boolean,
    showToolbar: boolean,
    arrowCurveExclFactor: number,
    width?: string,
    height?: string,
    arrowStyle?: 's-curve' | 'curve',
    arrowCurveFactor?: number | null,
    arrowGapFactor?: number,
    svgArrowPathProps?: React.SVGProps<SVGPathElement>,
    svgCircleProps?: React.SVGProps<SVGCircleElement>,
    fontSize?: number,
    fontColor?: string,
    minViewBox?: {
      w: number,
      h: number
    }
}

export default function SvgMindmapView({ data, dimensions, onDataChange, // eslint-disable-line @typescript-eslint/no-unused-vars
    showToolTip = true, 
    showToolbar = true, 
    arrowCurveExclFactor = 0.3,
    width = '100%',
    height = '100%',
    arrowStyle = 'curve',
    arrowCurveFactor = 0,
    arrowGapFactor = 0.15,
    svgArrowPathProps = { stroke: '#000', strokeWidth: 2 },
    svgCircleProps = { stroke: '#000', visibility: 'hidden' },
    fontSize = 12,
    fontColor = '#000',
    minViewBox
}: SvgMindmapProps) {
    if (!dimensions) {
        throw new Error('Dimensions are required');
    }

    const topLeftFor = (slot: Slot): Slot => {
        return { ...slot, x: slot.x - (slot.w / 2), y: slot.y - (slot.h / 2) };
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
                    <div className={styles.contentText} style={{ fontSize: fontSize, color: fontColor }}>
                      {showToolTip ? (
                        <span title={`${node.title} (${node.slot.x}, ${node.slot.y}/${normalizedSlot.x}, ${normalizedSlot.y})`}>
                          {node.title}
                        </span>
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

    const getArrows = (fromNode: MapNode, toNode: MapNode): JSX.Element => {
        const f = arrowCurveFactor ?? 1;

        if (!fromNode.slot || !toNode.slot) {
          throw new Error('Slot is required');
        }

        let anchorOut = fromNode.anchorPointsOut ?? [];
        let anchorIn = toNode.anchorPointsIn ?? [];

        if (anchorOut.length === 0) {
          const fromBox = Box.fromSlot(fromNode.slot);
          if (anchorIn.length > 0) {
            anchorOut = [ closestPoint(fromBox, anchorIn) ];
          } else {
            anchorOut = [ fromBox.closestTo(Box.fromSlot(toNode.slot)) ];
          }
        }

        if (anchorIn.length === 0) {
          const toBox = Box.fromSlot(toNode.slot);
          anchorIn = [ closestPoint(toBox, anchorOut) ];
        }

        const closestPair = closestPoints(anchorOut, anchorIn);
        let from = closestPair.pointA;
        let to = closestPair.pointB;

        let path = '';
        let arrowhead = null;

        // Shorten from-/to by gap
        if (arrowGapFactor) {
          const distance = from.calculateDistance(to);
          const gap = (distance * arrowGapFactor) / 2;
          const vector = Point.subtract(to, from);
          const normalized = Point.normalize(vector);
          from = Point.add(from, Point.multiply(normalized, gap));
          to = Point.subtract(to, Point.multiply(normalized, gap));
        }

        // TODO: the following cases are not currently implemented:
        // - Vertical lines
        // - Angled lines
        if (arrowStyle === 's-curve') {
          const totalDistance = Math.abs(to.x - from.x);
          let straightLength = totalDistance * arrowCurveExclFactor;
      
          // For arrows going left
          if (from.x > to.x) {
            straightLength = -straightLength;
          }
          
          const straightLineFromEnd = {
            x: from.x + straightLength,
            y: from.y
          };
          const straightLineToStart = {
            x: to.x - straightLength,
            y: to.y
          };

          path = from.y === to.y 
            ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`  // Straight line if Y's match
            : `M ${from.x} ${from.y}
              L ${straightLineFromEnd.x} ${straightLineFromEnd.y}
              C ${to.x - (f * straightLength)} ${straightLineFromEnd.y}, 
                ${from.x + (f * straightLength)} ${straightLineToStart.y}, 
                ${straightLineToStart.x} ${straightLineToStart.y}
              L ${to.x} ${to.y}`;

            // Create arrowhead
            const arrowSize = 8;
            arrowhead = to.x < from.x
            ? `M ${to.x + arrowSize} ${to.y - arrowSize}
              L ${to.x} ${to.y}
              L ${to.x + arrowSize} ${to.y + arrowSize}`
            : `M ${to.x - arrowSize} ${to.y - arrowSize}
              L ${to.x} ${to.y}
              L ${to.x - arrowSize} ${to.y + arrowSize}`;
        } else {
            const controlPoint = calculateArcControlPoint(from, to, f, false);
            path = `M${from.x} ${from.y} Q${controlPoint.x} ${controlPoint.y} ${to.x} ${to.y}`;
        }
      
        return (
            <>
                <path d={path} fill="none" stroke="#000" strokeWidth={2} {...svgArrowPathProps} />
                <circle cx={from.x} cy={from.y} r="4" fill="white" stroke="#000" strokeWidth={2} {...svgCircleProps} />
                {arrowhead && (
                    <path d={arrowhead} fill="none" stroke="#000" strokeWidth={2} {...svgArrowPathProps} />
                )}
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
              
                    return (
                        <React.Fragment key={child.slot.x + 'x' + child.slot.y}>
                            {renderNode(child)}
                            {getArrows(node, child)}
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

    if (minViewBox) {
      const width = dimensions.width();
      if (width < minViewBox.w) {
        const increaseBy = minViewBox.w - width;
        dimensions.left -= increaseBy / 2
        dimensions.right += increaseBy / 2
      }

      const height = dimensions.height();
      if (height < minViewBox.h) {
        const increaseBy = minViewBox.h - height;
        dimensions.top -= increaseBy / 2
        dimensions.bottom += increaseBy / 2
      }
    }

    return (
        <svg id="mindmap" style={{width: width, height: height}} viewBox={`${dimensions.left} ${dimensions.top} ${dimensions.right - dimensions.left} ${dimensions.bottom - dimensions.top}`}>
            {renderNode(clientData)}
        </svg>
    );
}
