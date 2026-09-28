'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CURRENCIES, useCurrency, type CurrencyCode } from '@/lib/hooks/useCurrency'
import { invalidateSubscriptionDependents } from '@/lib/hooks/query-keys'
import { cn } from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import {
  IMPORT_BATCH_SIZE,
  IMPORT_FIELDS,
  IMPORT_FIELD_LABELS,
  MAX_IMPORT_ROWS,
  REQUIRED_FIELDS,
  buildImportRows,
  defaultDateOrder,
  detectDateOrder,
  downloadCsv,
  exportFilename,
  guessMapping,
  hasAmbiguousDates,
  parseCsv,
  templateCsv,
  type ColumnMapping,
  type DateOrder,
  type ImportField,
  type ImportRowResult,
  type ParsedCsv,
} from '@/lib/utils/subscriptions-csv'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeftRight, Check, Download, FileUp, Loader2, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const NOT_MAPPED = 'none'

type ImportExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportExportDialog({ open, onOpenChange }: ImportExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="min-w-[300px] max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Import & Export
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="import">
          <TabsList className="w-full">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          <TabsContent value="import" className="pt-4">
            <ImportPanel />
          </TabsContent>
          <TabsContent value="export" className="pt-4">
            <ExportPanel />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function ExportPanel() {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/subscriptions/export')
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Export failed')
      }
      downloadCsv(exportFilename('suprascribe-subscriptions'), await res.text())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Downloads a CSV with one row per subscription: price, billing period, start and next billing
        date, status, category, payment method and total spent. It opens in Excel, Google Sheets and
        Numbers, and can be imported back here.
      </p>
      <div className="flex justify-center">
        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download CSV
        </Button>
      </div>
    </div>
  )
}

type ImportSummary = {
  imported: number
  duplicates: number
  failed: { row: number; error: string }[]
}

function ImportPanel() {
  const { currency: displayCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = React.useState<string | null>(null)
  const [csv, setCsv] = React.useState<ParsedCsv | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [mapping, setMapping] = React.useState<ColumnMapping>({})
  const [dateOrder, setDateOrder] = React.useState<DateOrder>('DMY')
  const [askDateOrder, setAskDateOrder] = React.useState(false)
  const [defaultCurrency, setDefaultCurrency] = React.useState<CurrencyCode>(displayCurrency)
  const [excluded, setExcluded] = React.useState<Set<number>>(new Set())
  const [isDragging, setIsDragging] = React.useState(false)
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null)
  const [summary, setSummary] = React.useState<ImportSummary | null>(null)

  const reset = () => {
    setFileName(null)
    setCsv(null)
    setFileError(null)
    setMapping({})
    setExcluded(new Set())
    setSummary(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const dateValues = React.useCallback(
    (parsed: ParsedCsv, map: ColumnMapping) =>
      (['startDate', 'nextDate'] as const).flatMap((field) => {
        const index = map[field]
        return index === undefined ? [] : parsed.rows.map((row) => row[index] ?? '')
      }),
    [],
  )

  const applyMapping = (parsed: ParsedCsv, map: ColumnMapping) => {
    setMapping(map)
    const values = dateValues(parsed, map)
    const detected = detectDateOrder(values)
    setDateOrder(detected ?? defaultDateOrder(navigator.language))
    setAskDateOrder(!detected && hasAmbiguousDates(values))
  }

  const handleFile = async (file: File) => {
    reset()
    setFileName(file.name)
    if (file.size > MAX_FILE_BYTES) {
      setFileError('That file is over 2 MB. Export only the subscriptions sheet and try again.')
      return
    }
    try {
      const parsed = parseCsv(await file.text())
      if (parsed.rows.length === 0) {
        setFileError('No rows found. The first line should be the column names.')
        return
      }
      if (parsed.rows.length > MAX_IMPORT_ROWS) {
        setFileError(`That file has ${parsed.rows.length} rows; the limit is ${MAX_IMPORT_ROWS}.`)
        return
      }
      if (parsed.errors.length > 0) {
        setFileError(`Some rows could not be read cleanly: ${parsed.errors.slice(0, 3).join('; ')}`)
      }
      setCsv(parsed)
      applyMapping(parsed, guessMapping(parsed.headers))
    } catch {
      setFileError('Could not read that file. Save it as CSV and try again.')
    }
  }

  const handleMappingChange = (field: ImportField, value: string) => {
    if (!csv) return
    const next: ColumnMapping = { ...mapping }
    if (value === NOT_MAPPED) {
      delete next[field]
    } else {
      const index = Number(value)
      // A column feeds one field; picking it here takes it away from any other.
      for (const key of IMPORT_FIELDS) if (next[key] === index) delete next[key]
      next[field] = index
    }
    applyMapping(csv, next)
  }

  const rows = React.useMemo(
    () => (csv ? buildImportRows(csv, mapping, { defaultCurrency, dateOrder }) : []),
    [csv, mapping, defaultCurrency, dateOrder],
  )

  const missingRequired = REQUIRED_FIELDS.filter((field) => mapping[field] === undefined)
  const ready = rows.filter((r) => r.data && !excluded.has(r.row))
  const errorCount = rows.filter((r) => !r.data).length

  const handleImport = async () => {
    const total = ready.length
    const result: ImportSummary = { imported: 0, duplicates: 0, failed: [] }
    setProgress({ done: 0, total })

    try {
      for (let start = 0; start < total; start += IMPORT_BATCH_SIZE) {
        const batch = ready.slice(start, start + IMPORT_BATCH_SIZE)
        const res = await fetch('/api/subscriptions/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: batch.map((r) => r.data) }),
        })
        const body = await res.json().catch(() => null)
        if (!res.ok) {
          const error = body?.error ?? 'Import failed'
          for (const r of ready.slice(start)) result.failed.push({ row: r.row, error })
          break
        }
        for (const item of body.data as ImportRowResult[]) {
          if (item.status === 'imported') result.imported++
          else if (item.status === 'duplicate') result.duplicates++
          else result.failed.push({ row: batch[item.index].row, error: item.error ?? 'Failed' })
        }
        setProgress({ done: Math.min(start + batch.length, total), total })
      }
    } catch {
      result.failed.push({ row: 0, error: 'Connection lost; some rows may not have been imported' })
    } finally {
      setProgress(null)
      setSummary(result)
      if (result.imported > 0) invalidateSubscriptionDependents(queryClient)
    }
  }

  if (summary) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Imported" value={summary.imported} />
          <Stat label="Already there" value={summary.duplicates} />
          <Stat label="Failed" value={summary.failed.length} />
        </div>
        {summary.failed.length > 0 && (
          <ul className="max-h-40 overflow-y-auto space-y-1 text-xs text-destructive">
            {summary.failed.map((f, i) => (
              <li key={i}>
                {f.row > 0 && `Row ${f.row}: `}
                {f.error}
              </li>
            ))}
          </ul>
        )}
        <Button variant="outline" onClick={reset}>
          Import another file
        </Button>
      </div>
    )
  }

  if (!csv) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Move subscriptions in from a spreadsheet or another tracker.{' '}
          <button
            type="button"
            onClick={() => downloadCsv('suprascribe-template.csv', templateCsv())}
            className="underline hover:text-foreground"
          >
            Download a template
          </button>
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) void handleFile(file)
          }}
          className={cn(
            'flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-accent',
            isDragging && 'border-primary bg-accent',
          )}
        >
          <FileUp className="h-8 w-8 text-muted-foreground" />
          <span className="font-medium">Choose a CSV file or drop it here</span>
          <span className="text-xs text-muted-foreground">
            From Excel, Google Sheets, Numbers or another subscription tracker. The first row must
            hold the column names.
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />
        {fileError && <p className="text-sm text-destructive">{fileError}</p>}
      </div>
    )
  }

  const sampleFor = (index: number) => csv.rows.find((row) => row[index])?.[index] ?? ''

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate">
          <span className="font-medium">{fileName}</span>
          <span className="text-muted-foreground"> · {csv.rows.length} rows</span>
        </span>
        <Button variant="ghost" size="sm" onClick={reset}>
          Change file
        </Button>
      </div>
      {fileError && <p className="text-xs text-amber-600 dark:text-amber-500">{fileError}</p>}

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Match your columns</h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {IMPORT_FIELDS.map((field) => {
            const index = mapping[field]
            const required = REQUIRED_FIELDS.includes(field)
            return (
              <div key={field} className="flex items-center gap-2">
                <Label className="w-32 shrink-0 text-xs font-normal">
                  {IMPORT_FIELD_LABELS[field]}
                  {required && <span className="text-destructive"> *</span>}
                </Label>
                <Select
                  value={index === undefined ? NOT_MAPPED : String(index)}
                  onValueChange={(value) => handleMappingChange(field, value)}
                >
                  <SelectTrigger size="sm" className="w-full min-w-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NOT_MAPPED}>
                      <span className="text-muted-foreground">Not in file</span>
                    </SelectItem>
                    {csv.headers.map((header, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {header}
                        {sampleFor(i) && (
                          <span className="text-muted-foreground">
                            {' '}
                            - {sampleFor(i).slice(0, 24)}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-wrap gap-4">
        {askDateOrder && (
          <div className="flex items-center gap-2">
            <Label className="text-xs font-normal">Dates are written</Label>
            <Select value={dateOrder} onValueChange={(v) => setDateOrder(v as DateOrder)}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DMY">Day / Month / Year</SelectItem>
                <SelectItem value="MDY">Month / Day / Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-normal">Currency when the file has none</Label>
          <Select
            value={defaultCurrency}
            onValueChange={(v) => setDefaultCurrency(v as CurrencyCode)}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CURRENCIES).map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {missingRequired.length > 0 ? (
        <p className="text-sm text-destructive">
          Pick the column for {missingRequired.map((f) => IMPORT_FIELD_LABELS[f]).join(' and ')}.
        </p>
      ) : (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">
            Preview{' '}
            <span className="font-normal text-muted-foreground">
              · {ready.length} ready
              {errorCount > 0 && `, ${errorCount} can't be imported`}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Untick any row you don&apos;t want to import. Check the icon on the right of each row to
            verify import readiness.
          </p>
          <div className="max-h-72 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead className="whitespace-nowrap">Next billing</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const source = csv.rows[r.row - 1]
                  return (
                    <TableRow key={r.row} className={cn(!r.data && 'opacity-60')}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Include row ${r.row}`}
                          disabled={!r.data}
                          checked={Boolean(r.data) && !excluded.has(r.row)}
                          onCheckedChange={(checked) =>
                            setExcluded((prev) => {
                              const next = new Set(prev)
                              if (checked) next.delete(r.row)
                              else next.add(r.row)
                              return next
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="max-w-40 truncate font-medium">
                        {r.data?.serviceName ??
                          (mapping.name !== undefined ? source[mapping.name] : '')}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {r.data ? formatCurrencyAmount(r.data.price, r.data.currency) : ''}
                      </TableCell>
                      <TableCell>
                        {r.data ? (r.data.period?.toLowerCase() ?? 'one-time') : ''}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {r.data?.startDate}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {r.data?.endDate}
                      </TableCell>
                      <TableCell className="w-8">
                        <RowCheck errors={r.errors} warnings={r.warnings} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <div className="flex items-center justify-end gap-3">
        {progress && (
          <span className="text-xs text-muted-foreground">
            {progress.done} / {progress.total}
          </span>
        )}
        <Button
          onClick={handleImport}
          disabled={ready.length === 0 || missingRequired.length > 0 || progress !== null}
          className="gap-2"
        >
          {progress && <Loader2 className="h-4 w-4 animate-spin" />}
          Import {ready.length} subscription{ready.length === 1 ? '' : 's'}
        </Button>
      </div>
    </div>
  )
}

function RowCheck({ errors, warnings }: { errors: string[]; warnings: string[] }) {
  const ready = errors.length === 0
  const messages = ready ? warnings : errors
  const Icon = ready ? Check : X

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={ready ? 'Ready to import' : 'Cannot be imported'}
          className={cn(
            'flex size-5 items-center justify-center',
            !ready
              ? 'text-destructive'
              : warnings.length > 0
                ? 'text-amber-600 dark:text-amber-500'
                : 'text-emerald-600 dark:text-emerald-500',
          )}
        >
          <Icon className="size-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px]">
        {messages.length === 0 ? (
          <p>Ready to import</p>
        ) : (
          messages.map((message) => <p key={message}>{message}</p>)
        )}
      </TooltipContent>
    </Tooltip>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
