const data = [
      {
        "title": "North America",
        "salesLead": "Sarah Johnson",
        "salesPlays": [
          {
            "title": "Enterprise Cloud Solutions",
            "budget": 500000,
            "currency": "USD",
            "salesLead": "Michael Chen"
          }
        ]
      },
      {
        "title": "European Union", 
        "salesLead": "Marie Dubois",
        "salesPlays": [
          {
            "title": "Manufacturing Innovation",
            "budget": 400000,
            "currency": "EUR",
            "salesLead": "Andreas Schmidt"
          },
          {
            "title": "Financial Services Modernization",
            "budget": 450000,
            "currency": "EUR",
            "salesLead": "Isabella Romano"
          }
        ]
      },
      {
        "title": "Asia Pacific",
        "salesLead": "James Wong",
        "salesPlays": [
          {
            "title": "E-commerce Integration",
            "budget": 800000,
            "currency": "USD",
            "salesLead": "Akiko Tanaka"
          },
          {
            "title": "Smart Cities Initiative",
            "budget": 600000,
            "currency": "USD",
            "salesLead": "Raj Patel"
          },
          {
            "title": "Digital Banking Solutions",
            "budget": 450000,
            "currency": "USD",
            "salesLead": "Li Wei"
          }
        ]
      },
      {
        "title": "Latin America",
        "salesLead": "Carlos Ruiz",
        "salesPlays": [
          {
            "title": "Telecom Infrastructure",
            "budget": 300000,
            "currency": "USD",
            "salesLead": "Ana Silva"
          },
          {
            "title": "Retail Digitalization",
            "budget": 250000,
            "currency": "USD",
            "salesLead": "Diego Torres"
          },
          {
            "title": "Fintech Solutions",
            "budget": 400000,
            "currency": "USD",
            "salesLead": "Gabriela Santos"
          },
          {
            "title": "Agriculture Tech",
            "budget": 350000,
            "currency": "USD",
            "salesLead": "Roberto Mendoza"
          }
        ]
      },
      {
        "title": "Middle East",
        "salesLead": "Ahmed Hassan",
        "salesPlays": [
          {
            "title": "Smart Government",
            "budget": 900000,
            "currency": "USD",
            "salesLead": "Fatima Al-Said"
          },
          {
            "title": "Oil & Gas Digitalization",
            "budget": 1200000,
            "currency": "USD",
            "salesLead": "Omar Sheikh"
          },
          {
            "title": "Healthcare Innovation",
            "budget": 600000,
            "currency": "USD",
            "salesLead": "Leila Mansour"
          },
          {
            "title": "Education Technology",
            "budget": 400000,
            "currency": "USD",
            "salesLead": "Yousef Rahman"
          },
          {
            "title": "Sustainable Energy Solutions",
            "budget": 800000,
            "currency": "USD",
            "salesLead": "Noor Ibrahim"
          }
        ]
      }
];

const fxConst = {
  nodeX: 200,
  spaceX: 100,
  nodeY: 70,
  spaceY: 25
};

function layoutMindmap(nodes, svgElement, title = "My Plan", relayout = false) {
  layoutMindmap.balanceNodes = function(nodes) {
    const sorted = [...nodes].sort((a, b) => b.salesPlays.length - a.salesPlays.length);
    
    const right = [sorted[0]];
    const left = sorted.length > 1 ? [sorted[1]] : [];
    let rightSum = sorted[0].salesPlays.length;
    let leftSum = sorted.length > 1 ? sorted[1].salesPlays.length : 0;

    for (let i = 2; i < sorted.length; i++) {
        if (rightSum <= leftSum) {
            right.push(sorted[i]);
            rightSum += sorted[i].salesPlays.length;
        } else {
            left.push(sorted[i]);
            leftSum += sorted[i].salesPlays.length;
        }
    }

    return { left, right, leftSum, rightSum };
  }

  layoutMindmap.getChildNodeSlots = function(amount, fxParent, left = false) {
    const sign = left ? -1 : 1;
    const slots = [];

    if (amount < 1) {
      return slots;
    }

    // Positions are from center of the node to avoid differences in left and right logic
    // This may lead to rounding
    const fxObj = {
      w: fxConst.nodeX,
      h: fxConst.nodeY
    };
    fxObj.x = fxParent.x + (sign * Math.abs(fxParent.w / 2 + fxObj.w / 2 + fxConst.spaceX));

    if (amount === 1) {
      slots.push({
        y: fxParent.y,
        ...fxObj
      })
    } else {
      // Negative Y is up to conform with SVG Canvas Y-axis
      const totalHeight = amount * fxObj.h;
      const startY = fxParent.y - (totalHeight / 2);

      for (let i = 0; i < amount; i++) {
          let o = {
              y: startY + (i * fxConst.spaceY) + (i * fxObj.h),
              ...fxObj
          };
          slots.push(layoutMindmap.slot(o.x, o.y, o.w, o.h));
      }
    }

    return slots;
  }

  layoutMindmap.updateDimensions = function(slot) {
    // Update dimensions
    const nodeXMin = slot.x - (slot.w / 2);
    const nodeXMax = slot.x + (slot.w / 2);
    const nodeYMin = slot.y - (slot.h / 2);
    const nodeYMax = slot.y + (slot.h / 2);
    if (dimensions.xMin > nodeXMin) dimensions.xMin = nodeXMin;
    if (dimensions.xMax < nodeXMax) dimensions.xMax = nodeXMax;
    if (dimensions.yMin > nodeYMin) dimensions.yMin = nodeYMin;
    if (dimensions.yMax < nodeYMax) dimensions.yMax = nodeYMax;
  }

  layoutMindmap.slot = function(x, y, w = fxConst.nodeX, h = fxConst.nodeY, title = null) {
    const obj = {
      x: x,
      y: y,
      w: w,
      h: h,
      children: []
    };
    if (title) obj.title = title;
    return obj;
  }

  layoutMindmap.distributeSide = function(_nodes, fxParent, left = false) {
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
      }
    }

    // Slots are evenly (y axis) distributed coordinate sets relative to the parent node
    const slots = layoutMindmap.getChildNodeSlots(totalSubnodes, fxParent, left);
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
      const nodeSlot = { ...node, ...layoutMindmap.slot(nodeSlots[0].x, (minY + maxY) / 2) };

      if (node.salesPlays) {
        // Offset slots on x and fill
        const newX = nodeSlot.x + (Math.abs(fxConst.spaceX + fxConst.nodeX) * sign);
        for (let z = 0; z < node.salesPlays.length; z++) {
          const cNode = node.salesPlays[z];
          const cSlot = layoutMindmap.slot(newX, nodeSlots[z].y, fxConst.nodeX, fxConst.nodeY);
          layoutMindmap.updateDimensions(cSlot);
          nodeSlot.children.push({ ...cNode, ...cSlot });
        }
      }

      layoutMindmap.updateDimensions(nodeSlot);
      fxParent.children.push(nodeSlot);
    }
  }

  const { left, right, leftSum, rightSum } = layoutMindmap.balanceNodes(data);

  const dimensions = {
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0
  };

  const root = layoutMindmap.slot(0, 0, fxConst.nodeX, fxConst.nodeY, title);
  layoutMindmap.distributeSide(left, root, true);
  layoutMindmap.distributeSide(right, root, false);

  // Re-center root node
  const yCenter = (dimensions.yMax - Math.abs(dimensions.yMin)) / 2;
  root.y = yCenter;

  return { fxNodes: root, dimensions };
}

function drawMindmap(fx, dimensions, svgElement) {
  drawMindmap.config = {
    showTooltip: true,
    showControlBar: true,
    arrowColor: '#ff6a3d'
  };

  function getRect(x, y, w, h, text = '', fill = 'black') {
    return `
      <foreignObject x="${x}" y="${y}" width="${w}" height="${h}" style="overflow: visible;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: ${h}px; position: relative;">
            <div class="foreign-div">
                <div class="content">
                    <div class="content-text" ${drawMindmap.config.showTooltip ? `onmouseover="showTooltip('${text}')" onmouseout="hideTooltip()"` : ''}>
                      ${text}
                    </div>
                </div>
                ${drawMindmap.config.showControlBar ? `
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

  function createArrow(fxNodeFrom, fxNodeTo, color = 'black', curveExclFactor = 0.3) {
    const fromX = fxNodeFrom.x;
    const fromY = fxNodeFrom.y;
    const toX = fxNodeTo.x;
    const toY = fxNodeTo.y;

    const totalDistance = Math.abs(toX - fromX);
    let straightLength = totalDistance * curveExclFactor;

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
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2"/>
      <path d="${arrowhead}" fill="none" stroke="${color}" stroke-width="2"/>
      <circle cx="${fromX}" cy="${fromY}" r="4" fill="white" stroke="${color}" stroke-width="2"/>
    `;
  }

  function topLeftFor(fxNode) {
    return { ...fxNode, x: fxNode.x - (fxNode.w / 2), y: fxNode.y - (fxNode.h / 2) };
  }

  function midRightFor(fxNode) {
    return { ...fxNode, x: fxNode.x + (fxNode.w / 2) };
  }

  function midLeftFor(fxNode) {
    return { ...fxNode, x: fxNode.x - (fxNode.w / 2) };
  }

  function getNodes(fxNode) {
    let inner = '';
    correctedPos = topLeftFor(fxNode);
    inner += getRect(correctedPos.x, correctedPos.y, fxNode.w, fxNode.h, fxNode.title);
    fxNode.children.forEach(child => {
      inner += getNodes(child);

      let arrowStart = null;
      let arrowEnd = null;
      if (fxNode.x > child.x) {
        arrowStart = midLeftFor(fxNode);
        arrowEnd = midRightFor(child);
      } else {
        arrowStart = midRightFor(fxNode);
        arrowEnd = midLeftFor(child);
      }

      inner += createArrow(arrowStart, arrowEnd, drawMindmap.config.arrowColor);
    });
    return inner;
  }

  const canvas = {
    x: dimensions.xMin,
    y: dimensions.yMin,
    w: dimensions.xMax - dimensions.xMin,
    h: dimensions.yMax - dimensions.yMin
  };

  const inner = getNodes(fx);
  svgElement.innerHTML = inner;
  svgElement.setAttribute('viewBox', `${canvas.x} ${canvas.y} ${canvas.w} ${canvas.h}`);
}

layoutMindmap();