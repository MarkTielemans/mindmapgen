import { Box, Point, PointsPair } from "../Mindmap.types";

export function closestPoints(arrayA: Point[], arrayB: Point[]): PointsPair {
    // Handle edge cases
    if (arrayA.length === 0 || arrayB.length === 0) {
        throw new Error('No points to compare');
    }

    let closestPairs: PointsPair[] = [{
        pointA: arrayA[0],
        pointB: arrayB[0],
        distance: arrayA[0].calculateDistance(arrayB[0])
    }];

    // Compare each point in arrayA with each point in arrayB
    for (const pointA of arrayA) {
        for (const pointB of arrayB) {
            const distance = pointA.calculateDistance(pointB);
            
            if (distance < closestPairs[0].distance) {
                closestPairs = [{
                    pointA,
                    pointB,
                    distance
                }];
            } else if (distance === closestPairs[0].distance) {
                closestPairs.push({
                    pointA,
                    pointB,
                    distance
                });
            }
        }
    }

    if (closestPairs.length === 1) {
        return closestPairs[0];
    }
    
    // Calculate pairA boundaries
    const minA = { x: 0, y: 0 };
    const maxA = { x: 0, y: 0 };
    const minB = { x: 0, y: 0 };
    const maxB = { x: 0, y: 0 };
    for (const pair of closestPairs) {
        if (pair.pointA.x < minA.x) {
            minA.x = pair.pointA.x;
        }
        if (pair.pointA.x > maxA.x) {
            maxA.x = pair.pointA.x;
        }
        if (pair.pointA.y < minA.y) {
            minA.y = pair.pointA.y;
        }
        if (pair.pointA.y > maxA.y) {
            maxA.y = pair.pointA.y;
        }
        if (pair.pointB.x < minB.x) {
            minB.x = pair.pointB.x;
        }
        if (pair.pointB.x > maxB.x) {
            maxB.x = pair.pointB.x;
        }
        if (pair.pointB.y < minB.y) {
            minB.y = pair.pointB.y;
        }
        if (pair.pointB.y > maxB.y) {
            maxB.y = pair.pointB.y;
        }
    }
    const aCenter = new Point((minA.x + maxA.x) / 2, (minA.y + maxA.y) / 2);
    const bCenter = new Point((minB.x + maxB.x) / 2, (minB.y + maxB.y) / 2);
    
    let preferredPair = null;
    for (const pair of closestPairs) {
        const aDelta = Math.abs(pair.pointA.x - aCenter.x) + Math.abs(pair.pointA.y - aCenter.y);
        const bDelta = Math.abs(pair.pointB.x - bCenter.x) + Math.abs(pair.pointB.y - bCenter.y);

        const delta = aDelta + bDelta;
        if (preferredPair === null || delta < preferredPair.delta) {
            preferredPair = {
                p: pair,
                delta
            };
        }
    }

    return preferredPair?.p ?? closestPairs[0];
}

export function closestPoint(box: Box, points: Point[]): Point {
    let closest = null;

    for (const point of points) {
        const boxPoint = box.closestToPoint(point);
        const distance = point.calculateDistance(boxPoint);
        const centerDistance = boxPoint.calculateDistance(box.center());

        if (closest === null || distance < closest.distance) {
            closest = { point: boxPoint, distance, centerDistance };
        } else if (centerDistance < closest.centerDistance) {
            closest = { point: boxPoint, distance, centerDistance };
        }

        if (distance === 0) {
            break;
        }
    }

    if (closest === null) {
        throw new Error('No closest point found');
    }

    return closest.point;
}

/**
* Calculate the control point for a quadratic Bézier curve
* that forms an arc between two points
* 
* @param p0 Starting point
* @param p1 Ending point
* @param factor Amount of curve bulge (positive or negative)
* @param clockwise Whether to curve clockwise (true) or counter-clockwise (false)
* @returns The control point for the quadratic Bézier curve
*/
export function calculateArcControlPoint(
   p0: Point, 
   p1: Point, 
   factor: number, 
   clockwise: boolean = true
): Point {
   const midpoint = Point.midpoint(p0, p1);
   const vector = Point.subtract(p1, p0);
   const perpVector = Point.perpendicular(vector, clockwise);
   const normalizedPerp = Point.normalize(perpVector);
   const scaledPerp = Point.multiply(normalizedPerp, factor * 10);
   return Point.add(midpoint, scaledPerp);
}

