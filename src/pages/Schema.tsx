import { useState, useRef } from 'react'
import { MonacoEditor } from '@/components/editor/MonacoEditor'
import { EditorToolbar } from '@/components/editor/Toolbar'
import { DocumentTabs } from '@/components/editor/DocumentTabs'
import { Button } from '@/components/common/Button'
import { FileSearch, Upload, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useSchema } from '@/hooks/useSchema'
import { useEditorStore } from '@/store/editorStore'
import { readFileAsText } from '@/utils/upload'
import toast from 'react-hot-toast'

export default function SchemaPage() {
  const content = useEditorStore((s) => s.content)
  const { result, isValidSchema, loadSchema, validate, clear } = useSchema()
  const [schemaInput, setSchemaInput] = useState('')
  const schemaInputRef = useRef<HTMLInputElement>(null)

  const handleUploadSchema = async () => {
    schemaInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      setSchemaInput(text)
      loadSchema(text)
      toast.success('Schema loaded')
    } catch {
      toast.error('Failed to read schema file')
    }
    e.target.value = ''
  }

  const handleValidate = () => {
    if (!schemaInput.trim()) {
      toast.error('Please enter or upload a schema')
      return
    }
    try {
      JSON.parse(schemaInput)
      loadSchema(schemaInput)
      validate(content)
      toast.success('Schema validation complete')
    } catch {
      toast.error('Invalid JSON schema format')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar />
      <DocumentTabs />
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <MonacoEditor />
          </div>
        </div>
        <div className="w-[300px] border-l border-border bg-panel flex flex-col overflow-hidden">
          <div className="h-8 flex items-center px-3 border-b border-border shrink-0">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Schema</span>
          </div>
          <div className="p-3 border-b border-border">
            <input ref={schemaInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            <div className="flex gap-1.5">
              <Button size="xs" variant="secondary" icon={<Upload size={13} />} onClick={handleUploadSchema}>Upload</Button>
              <Button size="xs" icon={<FileSearch size={13} />} onClick={handleValidate}>Validate</Button>
              {result && <Button size="xs" variant="ghost" icon={<X size={13} />} onClick={clear} />}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <textarea
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder="Paste JSON schema here..."
              className="w-full h-[160px] bg-editor-bg border border-border p-3 text-[11px] font-mono text-text outline-none focus:border-primary resize-none placeholder:text-text-muted transition-colors"
            />
            {!isValidSchema && schemaInput.trim() && (
              <p className="text-[11px] text-danger mt-2">Invalid JSON schema format</p>
            )}
            {result && (
              <div className="mt-3 space-y-2">
                <div className={`flex items-center gap-2 text-[12px] font-medium ${result.valid ? 'text-success' : 'text-danger'}`}>
                  {result.valid ? <CheckCircle size={14} strokeWidth={2} /> : <XCircle size={14} strokeWidth={2} />}
                  {result.valid ? 'Valid against schema' : `${result.errors.length} error(s)`}
                </div>
                {result.errors.map((err, i) => (
                  <div key={i} className="border border-border p-2.5">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle size={12} className="text-warning mt-0.5 shrink-0" strokeWidth={2} />
                      <div className="text-[11px]">
                        <p className="text-text-muted">{err.path}</p>
                        <p className="text-text mt-0.5">{err.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!result && !schemaInput.trim() && (
              <div className="text-text-muted text-[11px] text-center py-8">Upload a JSON schema to validate against</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
