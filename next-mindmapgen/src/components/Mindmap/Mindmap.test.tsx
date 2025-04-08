import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'

import Mindmap from './Mindmap'
import JsonView from './render/JsonView'

test('Mindmap', () => {
    const data = {
        title: "Root",
        children: [
          { title: "Node 1", children: [
            { title: "Node 1.1", children: [] },
            { title: "Node 1.2", children: [] },
          ] },
          { title: "Node 2", children: [
            { title: "Node 2.1", children: [] },
            { title: "Node 2.2", children: [] },
            { title: "Node 2.3", children: [] }
          ] },
        ],
    };
    render(<Mindmap data={data} onDataChange={() => {}} Renderer={JsonView} />)
    const pre = screen.getByTestId('json-view').textContent;
    expect(pre).not.toBeNull();
    if (!pre) { return; }

    const parsed = JSON.parse(pre);
    expect(parsed.title).toEqual(data.title);
})

