import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Thin wrappers over the native table elements. No client JS and no Radix, so these render
 * inside server components - which matters here, because the blog tables have to be in the
 * server-rendered HTML for crawlers and AI fetchers to read them.
 *
 * `Table` deliberately does NOT provide its own scroll container: callers wrap it in one so
 * they can label it and make it keyboard-reachable.
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <table data-slot="table" className={cn('w-full text-left text-sm', className)} {...props} />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('bg-muted/50', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody data-slot="table-body" className={cn('text-muted-foreground', className)} {...props} />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr data-slot="table-row" className={cn('border-t', className)} {...props} />
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn('px-4 py-3 align-top font-semibold', className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('px-4 py-3 align-top', className)} {...props} />
}

/** Rendered at the top of the table - it names the dataset for screen readers and for extraction. */
function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('caption-top px-4 py-3 text-left text-sm font-medium', className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption }
