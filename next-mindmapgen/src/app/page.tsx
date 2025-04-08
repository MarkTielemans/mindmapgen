'use client'

import Mindmap from "@/components/Mindmap";
import HorizontalLayoutEngine from "@/components/Mindmap/layout/HorizontalLayoutEngine";
import RadialLayoutEngine from "@/components/Mindmap/layout/RadialLayoutEngine";
import JsonView from "@/components/Mindmap/render/JsonView";
import SvgMindmapView from "@/components/Mindmap/render/SvgMindmapView";
import { useEffect, useState } from "react";
import { toast } from "sonner"

export default function Home() {
  const horizontalEngine = new HorizontalLayoutEngine();
  const radialEngine = new RadialLayoutEngine({ nodeX: 100, nodeY: 100, radius: 200 });

  const layouts = [{
    stroke: '#fff',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'bevel',
    strokeDasharray: '0',
    circleFill: '#0a0a0a',
    circleStroke: '#fff',
    circleVisibility: 'visible',
    arrowStyle: 's-curve',
    arrowCurveFactor: 1,
    arrowCurveExclFactor: 0.2,
    arrowGapFactor: 0,
    engine: horizontalEngine
  }, {
    stroke: 'pink',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'bevel',
    strokeDasharray: '10 5',
    circleFill: '#0a0a0a',
    circleStroke: '#fff',
    circleVisibility: 'hidden',
    arrowStyle: 'curve',
    arrowCurveFactor: 2,
    arrowCurveExclFactor: 0,
    arrowGapFactor: 0.2,
    engine: horizontalEngine
  }, {
    stroke: '#fff',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'bevel',
    strokeDasharray: '0',
    circleFill: '#0a0a0a',
    circleStroke: '#fff',
    circleVisibility: 'hidden',
    arrowStyle: 's-curve',
    arrowCurveFactor: 1,
    arrowCurveExclFactor: 0.5,
    arrowGapFactor: 0.1,
    engine: horizontalEngine
  }, {
    stroke: 'grey',
    strokeWidth: 1,
    strokeLinecap: 'round',
    strokeLinejoin: 'bevel',
    strokeDasharray: '0',
    circleFill: '#0a0a0a',
    circleStroke: '#fff',
    circleVisibility: 'hidden',
    arrowStyle: 'curve',
    arrowCurveFactor: 1.3,
    arrowCurveExclFactor: 0,
    arrowGapFactor: 0.4,
    engine: radialEngine
  }] as const;
  const renderers = [SvgMindmapView, JsonView] as const;

  const [defaultData, setDefaultData] = useState({
    id: crypto.randomUUID(),
    title: "🌟 Adventure Time!",
    children: [
      {
        id: crypto.randomUUID(),
        title: "🏰 Magic Kingdom",
        children: [
          {
            id: crypto.randomUUID(),
            title: "🧙‍♂️ Wizard's Tower",
            children: []
          },
          {
            id: crypto.randomUUID(),
            title: "🐉 Dragon's Lair",
            children: []
          },
          {
            id: crypto.randomUUID(),
            title: "🎭 Enchanted Theater",
            children: []
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: "🌊 Ocean Depths",
        children: [
          {
            id: crypto.randomUUID(),
            title: "🐠 Coral City",
            children: []
          },
          {
            id: crypto.randomUUID(),
            title: "🐋 Whale Songs",
            children: []
          },
          {
            id: crypto.randomUUID(),
            title: "🏊‍♂️ Mermaid Cove",
            children: []
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: "🚀 Space Journey",
        children: [
          {
            id: crypto.randomUUID(),
            title: "👽 Alien Cafe",
            children: []
          },
          {
            id: crypto.randomUUID(),
            title: "🌠 Stardust Park",
            children: []
          },
          {
            id: crypto.randomUUID(),
            title: "🎮 Cosmic Arcade",
            children: []
          }
        ]
      }
    ]
  });

  const [additionalNodes, setAdditionalNodes] = useState([
    {
      id: crypto.randomUUID(),
      title: "🌋 Volcanic Realms",
      children: [
        {
          id: crypto.randomUUID(),
          title: "🔥 Lava Falls",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "⛏️ Gem Mines",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "🏺 Ancient Forge",
          children: []
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: "🌲 Enchanted Forest",
      children: [
        {
          id: crypto.randomUUID(),
          title: "🦌 Mystical Glade",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "🍄 Mushroom Village",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "🦉 Wise Tree",
          children: []
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: "❄️ Frozen Tundra",
      children: [
        {
          id: crypto.randomUUID(),
          title: "🏔️ Crystal Peaks",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "🐧 Penguin Slides",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "🧊 Ice Palace",
          children: []
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: "🏜️ Desert Mysteries",
      children: [
        {
          id: crypto.randomUUID(),
          title: "🐪 Caravan Oasis",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "🏺 Lost Temple",
          children: []
        },
        {
          id: crypto.randomUUID(),
          title: "🔮 Mirage Market",
          children: []
        }
      ]
    }
  ]);

  const buttons = [
    {
      id: 0,
      text: 'Toggle Renderer',
      onClick: () => {
        const newStyle = renderer + 1;
        if (newStyle >= renderers.length) {
          setRenderer(0);
        } else {
          setRenderer(newStyle);
        }
      }
    },
    {
      id: 1,
      text: 'Toggle Style',
      onClick: () => {
        const newLayout = layout + 1;
        console.log(newLayout, layouts.length);
        if (newLayout >= layouts.length) {
          setLayout(0);
        } else {
          setLayout(newLayout);
        }
      }
    },
    {
      id: 2,
      text: 'Toggle L2',
      onClick: () => {
        setShowChildren(!showChildren);
      }
    },
    {
      id: 3,
      text: 'Add Node',
      onClick: () => {
        if (additionalNodes.length > 0) {
          const nodes = [...additionalNodes];
          const node = nodes.pop()!;
          
          setAdditionalNodes(nodes);
          setDefaultData({
            ...defaultData,
            children: [...defaultData.children, node]
          });
        } else {
          toast.error('Out of nodes!', {
            cancel: {
              label: 'Ok',
              onClick: () => {}
            },
          });
        }
      }
    }
  ];

  const [showChildren, setShowChildren] = useState(false);
  const [renderer, setRenderer] = useState(0);
  const [layout, setLayout] = useState(0);
  const [data, setData] = useState(defaultData);

  const currentLayout = layouts[layout];
  const currentRenderer = renderers[renderer];

  useEffect(() => {
    if (showChildren) {
      setData(defaultData);
    } else {
      // Remove all children's children
      const noChildren = defaultData.children.map((child) => {
        return {
          ...child,
          children: []
        }
      });
      setData({
        ...defaultData,
        children: noChildren
      });
    }
  }, [showChildren, defaultData]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 bg-gradient-to-br from-slate-900 via-blue-900/40 to-slate-900">
      <main className="flex-1 w-full p-4 pb-2 min-h-0">
        <div className="w-full h-full rounded-lg border border-blue-500/20 bg-slate-800/30 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(148,163,184,0.1)] overflow-auto">
          <Mindmap 
            data={data} 
            LayoutEngine={currentLayout.engine}
            Renderer={currentRenderer} 
            onDataChange={() => {}} 
            renderConfig={
              {
                fontSize: 12,
                arrowStyle: currentLayout.arrowStyle, 
                arrowCurveFactor: currentLayout.arrowCurveFactor, 
                arrowCurveExclFactor: currentLayout.arrowCurveExclFactor, 
                arrowGapFactor: currentLayout.arrowGapFactor,
                showToolbar: false, 
                svgArrowPathProps: {
                  stroke: currentLayout.stroke,
                  strokeWidth: currentLayout.strokeWidth, 
                  strokeLinecap: currentLayout.strokeLinecap, 
                  strokeLinejoin: currentLayout.strokeLinejoin, 
                  strokeDasharray: currentLayout.strokeDasharray
                }, 
                svgCircleProps: {
                  stroke: currentLayout.circleStroke,
                  fill: currentLayout.circleFill,
                  fillOpacity: 1,
                  visibility: currentLayout.circleVisibility
                },
                minViewBox: {
                  w: 300,
                  h: 300
                }
              }
            } />
        </div>
      </main>

      <div className="w-full px-6 pt-2 pb-4">
        <div className="flex justify-center gap-4">
          {buttons.map((button) => (
            <button key={button.id} className="px-5 py-2.5 rounded-md bg-blue-500/10 text-blue-100 border border-blue-400/20
                            hover:bg-blue-500/20 hover:border-blue-400/30
                            active:bg-blue-500/30 active:border-blue-400/40
                            transform active:scale-95 transition-all duration-150
                            font-medium backdrop-blur-sm cursor-pointer" onClick={button.onClick}>
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
