import React from "react";
import { RenderComponentProps } from "../Mindmap.types";
import { Textarea } from "@/components/ui/textarea"

export default function JsonView({ data }: RenderComponentProps) {
    return (
        <div className="h-full">
            <Textarea 
                data-testid="json-view"
                className="h-full font-mono resize-none text-white text-xs"
                readOnly
                value={JSON.stringify(data, null, 2)}
            />
        </div>
    );
}
