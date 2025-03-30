class MindmapLayout {
    constructor(nodes, config = {}, title = "My Plan") {
      this.nodes = nodes;
      this.title = title;
      this.config = Object.assign(
        {
          nodeX: 200,
          spaceX: 100,
          nodeY: 70,
          spaceY: 25,
        },
        config
      );
      this.dimensions = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    }
  
    balanceNodes(nodes) {
        if (!nodes || nodes.length === 0) {
            return { right: [], left: [], rightSum: 0, leftSum: 0 };
        }
        
        if (nodes.length === 1) {
            return {
                right: [nodes[0]],
                left: [],
                rightSum: nodes[0].salesPlays?.length || 0,
                leftSum: 0
            };
        }
    
        // Helper function to get node weight (number of sales plays)
        const getNodeWeight = (node) => node.salesPlays?.length || 0;
    
        // Sort nodes by weight (descending)
        const sorted = [...nodes].sort((a, b) => getNodeWeight(b) - getNodeWeight(a));
    
        // Initialize sides with first two nodes
        const sides = {
            right: [sorted[0]],
            left: [sorted[1]],
            rightSum: getNodeWeight(sorted[0]),
            leftSum: getNodeWeight(sorted[1])
        };
    
        // Distribute remaining nodes to balance the sides
        for (let i = 2; i < sorted.length; i++) {
            const currentNode = sorted[i];
            const nodeWeight = getNodeWeight(currentNode);
    
            if (sides.right.length <= sides.left.length) {
                sides.right.push(currentNode);
                sides.rightSum += nodeWeight;
            } else {
                sides.left.push(currentNode);
                sides.leftSum += nodeWeight;
            }
        }
    
        return sides;
    }
  
    getChildNodeSlots(amount, fxParent, left = false) {
        const sign = left ? -1 : 1;
        const slots = [];
    
        if (amount < 1) {
          return slots;
        }
    
        // Positions are from center of the node to avoid differences in left and right logic
        // This may lead to rounding
        const fxObj = {
          w: this.config.nodeX,
          h: this.config.nodeY
        };
        fxObj.x = fxParent.x + (sign * Math.abs(fxParent.w / 2 + fxObj.w / 2 + this.config.spaceX));

        if (amount === 1) {
          slots.push({
            y: fxParent.y,
            ...fxObj
          })
        } else {
          // Negative Y is up to conform with SVG Canvas Y-axis
          const totalHeight = (amount * fxObj.h) + ((amount - 1) * this.config.spaceY);
          const startY = fxParent.y - (totalHeight / 2);
    
          for (let i = 0; i < amount; i++) {
              let o = {
                  y: startY + (i * (this.config.spaceY + fxObj.h)) + (fxObj.h / 2),
                  ...fxObj
              };
              slots.push(this.createSlot(o.x, o.y, o.w, o.h));
          }
        }
        return slots;
    }
  
    createSlot(x, y, w = this.config.nodeX, h = this.config.nodeY) {
      return { x, y, w, h, children: [] };
    }
  
    updateDimensions(slot) {
      this.dimensions.xMin = Math.min(this.dimensions.xMin, slot.x - slot.w / 2);
      this.dimensions.xMax = Math.max(this.dimensions.xMax, slot.x + slot.w / 2);
      this.dimensions.yMin = Math.min(this.dimensions.yMin, slot.y - slot.h / 2);
      this.dimensions.yMax = Math.max(this.dimensions.yMax, slot.y + slot.h / 2);
    }
  
    distributeSide(_nodes, fxParent, left = false) {
        const sign = left ? -1 : 1;
        // If the nodes have children, then request that amount of slots to reserve space for them
        //   In this case, layout the node itself at the y-center of those slots
        // For nodes with no children, request 1 slot
        // +1 slot for spacing between branches
    
        // Calculate total subnodes (min 1 for each node)
        let totalSubnodes = 0;
        for (let x = 0; x < _nodes.length; x++) {
          if (_nodes[x].salesPlays) {
            totalSubnodes += Math.max(1, _nodes[x].salesPlays.length);
          } else {
            totalSubnodes += 1;
          }
        }

        // Slots are evenly (y axis) distributed coordinate sets relative to the parent node
        const slots = this.getChildNodeSlots(totalSubnodes, fxParent, left);
        let slotIndex = 0;
    
        // Consume slots per node
        for (let i = 0; i < _nodes.length; i++) {
          // 'Consume' the node's slots
          // Arrange the node in the y-center of the slots
          // Offset the slots on x
          // Distribute children into slots
          let node = _nodes[i];
          let size = Math.max(1, node.salesPlays ? node.salesPlays.length : 1);
          let nodeSlots = slots.slice(slotIndex, slotIndex + size);
          slotIndex += size;
    
          // Find lowest and highest y-values
          let minY = Math.min(...nodeSlots.map(slot => slot.y));
          let maxY = Math.max(...nodeSlots.map(slot => slot.y));
          const nodeSlot = { ...node, ...this.createSlot(nodeSlots[0].x, (minY + maxY) / 2) };
          console.log('nodeSlot', nodeSlot);
    
          if (node.salesPlays) {
            // Offset slots on x and fill
            const newX = nodeSlot.x + (Math.abs(this.config.spaceX + this.config.nodeX) * sign);
            for (let z = 0; z < node.salesPlays.length; z++) {
              const cNode = node.salesPlays[z];
              const cSlot = this.createSlot(newX, nodeSlots[z].y, this.config.nodeX, this.config.nodeY);
              this.updateDimensions(cSlot);
              nodeSlot.children.push({ ...cNode, ...cSlot });
            }
          }
    
          this.updateDimensions(nodeSlot);
          fxParent.children.push(nodeSlot);
        }
    }
  
    generateLayout() {
        const { left, right } = this.balanceNodes(this.nodes);
        const root = this.createSlot(0, 0, this.config.nodeX, this.config.nodeY);
        root.title = this.title;
        this.distributeSide(left, root, true);
        this.distributeSide(right, root, false);

        // Re-center root node
        // const yCenter = (this.dimensions.yMax - Math.abs(this.dimensions.yMin)) / 2;
        // root.y = yCenter;

        return { fxNodes: root, dimensions: this.dimensions };
    }
}  

class MindmapRenderer {
    constructor(config = {}) {
      this.config = Object.assign(
        {
          showTooltip: true,
          showControlBar: true,
          arrowColor: "#ff6a3d",
          arrowCurveExclFactor: 0.3,
        },
        config
      );
    }
  
    getRect(x, y, w, h, text = '') {
        return `
        <foreignObject x="${x}" y="${y}" width="${w}" height="${h}" style="overflow: visible;">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: ${h}px; position: relative;">
              <div class="foreign-div">
                  <div class="content" style="height: ${h}px;">
                      <div class="content-text" ${this.config.showTooltip ? `onmouseover="showTooltip('${text}')" onmouseout="hideTooltip()"` : ''}>
                        ${text}
                      </div>
                  </div>
                  ${this.config.showControlBar ? `
                  <div class="control-bar">
                      <button>
  
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                      <div class="spacer"></div>
                      <button>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                      </button>
                      <input type="text" value="$1000" />
                      <button>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      </button>
                  </div>` : ''}
              </div>
          </div>
      </foreignObject>`;
    }
  
    getArrows(from, to) {
        const fromX = from.x;
        const fromY = from.y;
        const toX = to.x;
        const toY = to.y;

        const totalDistance = Math.abs(toX - fromX);
        let straightLength = totalDistance * this.config.arrowCurveExclFactor;
    
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
      
        return `
          <path d="${path}" fill="none" stroke="${this.config.arrowColor}" stroke-width="2"/>
          <path d="${arrowhead}" fill="none" stroke="${this.config.arrowColor}" stroke-width="2"/>
          <circle cx="${fromX}" cy="${fromY}" r="4" fill="white" stroke="${this.config.arrowColor}" stroke-width="2"/>
        `;
    }

    topLeftFor(fxNode) {
        return { ...fxNode, x: fxNode.x - (fxNode.w / 2), y: fxNode.y - (fxNode.h / 2) };
    }

    midRightFor(fxNode) {
        return { ...fxNode, x: fxNode.x + (fxNode.w / 2) };
    }

    midLeftFor(fxNode) {
        return { ...fxNode, x: fxNode.x - (fxNode.w / 2) };
    }
  
    renderNode(fxNode) {
        let inner = '';
        const correctedPos = this.topLeftFor(fxNode);
        inner += this.getRect(correctedPos.x, correctedPos.y, fxNode.w, fxNode.h, fxNode.title);
        fxNode.children.forEach(child => {
          inner += this.renderNode(child);
          let arrowStart = null;
          let arrowEnd = null;
          if (fxNode.x > child.x) {
            arrowStart = this.midLeftFor(fxNode);
            arrowEnd = this.midRightFor(child);
          } else {
            arrowStart = this.midRightFor(fxNode);
            arrowEnd = this.midLeftFor(child);
          }

    
          inner += this.getArrows(arrowStart, arrowEnd, this.config.arrowColor);
        });
        return inner;
    }

    draw(fxNode, dimensions, svgElement) {
        const canvas = {
            x: dimensions.xMin,
            y: dimensions.yMin,
            w: dimensions.xMax - dimensions.xMin,
            h: dimensions.yMax - dimensions.yMin
        };

        const inner = this.renderNode(fxNode);
        svgElement.innerHTML = inner;
        svgElement.setAttribute('viewBox', `${canvas.x} ${canvas.y} ${canvas.w} ${canvas.h}`);
    }
}
  