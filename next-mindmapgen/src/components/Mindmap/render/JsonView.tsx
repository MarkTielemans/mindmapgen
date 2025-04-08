import React from "react";
import { RenderComponentProps } from "../Mindmap.types";

export default function JsonView({ data, onDataChange }: RenderComponentProps) {
    return (
        <>
            <pre data-testid="json-view">{JSON.stringify(data, null, 2)}</pre>
            <button
                onClick={() => {
                    onDataChange({
                        ...data,
                        title: `${data.title} ${data.title}`
                    });
                }}
            >
                Change Data
            </button>
        </>
    );
}
