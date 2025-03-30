# mindmapgen
Simple homebrew 2 tier mindmap generator.

# React
The mindmap component can display data in a reactive way and allows for interacting with the input data as well.
The Mindmap component must be configured with a renderer, such as `JsonView` or `SvgMindmapView`.

## Usage

### SVG Mindmap
```ts
import SvgMindmapView from "@/components/Mindmap/render/SvgMindmapView";

const [Renderer, setRenderer] = useState(() => SvgMindmapView);

return (
    <Mindmap data={data} onDataChange={onDataChange} Renderer={Renderer} renderConfig={{showToolTip: false, showControlBar: false, arrowColor: 'red', arrowCurveExclFactor: 0.8, dimensions: { x: 0, y: 0, w: 0, h: 0 }}} />
);
```

### JSON Dump
```ts
import JsonView from "@/components/Mindmap/render/JsonView";

const [Renderer, setRenderer] = useState(() => JsonView);

return (
    <Mindmap data={data} onDataChange={onDataChange} Renderer={Renderer} />
);
```