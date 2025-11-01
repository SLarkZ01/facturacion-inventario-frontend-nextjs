"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

// Provide a stable id for the trigger/content pair to avoid
// radix-generated ids mismatching between server and client.
const CollapsibleIdContext = React.createContext<string | undefined>(undefined)

function Collapsible({ id, ...props }: { id?: string } & React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const generatedId = React.useId()
  const value = id ?? generatedId

  return (
    <CollapsibleIdContext.Provider value={value}>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
    </CollapsibleIdContext.Provider>
  )
}

function CollapsibleTrigger({ id: propId, ...props }: { id?: string } & React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  const ctxId = React.useContext(CollapsibleIdContext)
  const id = propId ?? ctxId

  // ensure aria-controls points to the content id
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      aria-controls={id}
      {...props}
    />
  )
}

function CollapsibleContent({ id: propId, ...props }: { id?: string } & React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  const ctxId = React.useContext(CollapsibleIdContext)
  const id = propId ?? ctxId

  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      id={id}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
