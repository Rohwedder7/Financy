import type { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export function Dialog({
  children,
  onOpenChange,
  open,
}: {
  children: ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      {children}
    </DialogPrimitive.Root>
  )
}

export function DialogContent({
  children,
  figmaNode,
  labelledBy,
  onCloseAutoFocus,
  onOpenAutoFocus,
}: {
  children: ReactNode
  figmaNode?: string
  labelledBy: string
  onCloseAutoFocus?: (event: Event) => void
  onOpenAutoFocus?: (event: Event) => void
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-financy-ink/40" />
      <DialogPrimitive.Content
        aria-labelledby={labelledBy}
        className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-financy-border bg-white p-6 shadow-lg focus:outline-none"
        data-figma-node={figmaNode}
        onCloseAutoFocus={onCloseAutoFocus}
        onOpenAutoFocus={onOpenAutoFocus}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description
export const DialogClose = DialogPrimitive.Close
