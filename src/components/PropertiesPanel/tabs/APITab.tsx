import React, { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import CodeMirror from '@uiw/react-codemirror'
import { json as cmJson } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import styles from '../properties-panel.module.css'
import { sendTestRequest } from '@/api/mockServer'
import KeyValueEditor from '@/components/KeyValueEditor/KeyValueEditor'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export default function APITab() {
  const { register, watch, setValue } = useFormContext()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resp, setResp] = useState<any>(null)
  const [showHeaders, setShowHeaders] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showTest, setShowTest] = useState(false);


  const url = watch('url')
  const method = watch('method', 'POST')
  const headers = watch('headers', [])
  const body = watch('body', '')

  const jsonError = useMemo(() => {
    if (!body || body.trim() === '') return null
    try { JSON.parse(body) } catch (e: any) { return e?.message || 'Invalid JSON' }
    return null
  }, [body])

  async function runTest() {
    setBusy(true); setError(null); setResp(null)
    try {
      if (jsonError) { setError(`Body JSON: ${jsonError}`); setBusy(false); return }

      const result = await sendTestRequest({ url, method, headers, body })
      setResp(result)
    } catch (e: any) {
      setError(e?.message || 'Test failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.tabBody}>
        <div className="space-y-1">
            <Label>URL & Method</Label>
            <div className="flex gap-2">
                <Select value={method} onValueChange={(v) => setValue('method', v)}>
                    <SelectTrigger className="w-[100px]"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {(['GET','POST','PUT','PATCH','DELETE'] as Method[]).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input id="url" {...register('url')} placeholder="https://..." />
                <Button className="bg-green-600 hover:bg-green-700 text-white">Variables</Button>
            </div>
        </div>

        <hr className={styles.hr} />
        
        <Collapsible open={showHeaders} onOpenChange={setShowHeaders}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">Customize Headers</h4>
                    <p className="text-xs text-muted-foreground">Add headers to your request (example: Content-Type: application/json)</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Optional</span>
                    <CollapsibleTrigger asChild>
                        <Switch id="show-headers" checked={showHeaders} onCheckedChange={setShowHeaders} />
                    </CollapsibleTrigger>
                </div>
            </div>
             <p className="text-xs text-orange-500 mt-1">(User-Agent is not sent as a header by default. make sure you include it if necessary.)</p>
            <CollapsibleContent className="mt-4">
                 <KeyValueEditor items={headers} onChange={(v) => setValue('headers', v)} />
            </CollapsibleContent>
        </Collapsible>

        <hr className={styles.hr} />

        <Collapsible open={showBody} onOpenChange={setShowBody}>
            <div className="flex items-center justify-between">
                <h4 className="font-semibold">Customize Body</h4>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Optional</span>
                    <CollapsibleTrigger asChild>
                         <Switch id="show-body" checked={showBody} onCheckedChange={setShowBody} />
                    </CollapsibleTrigger>
                </div>
            </div>
            <CollapsibleContent className="mt-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Body (JSON)</Label>
                        {jsonError ? <span className={styles.warn}>Invalid JSON</span> : <span className={styles.ok}>Valid</span>}
                    </div>
                    <CodeMirror
                        value={body}
                        onChange={(v) => setValue('body', v)}
                        extensions={[cmJson()]}
                        height="150px"
                        theme={oneDark}
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>

        <hr className={styles.hr} />

        <Collapsible open={showTest} onOpenChange={setShowTest}>
            <div className="flex items-center justify-between">
                 <div>
                    <h4 className="font-semibold">Test Your Request</h4>
                    <p className="text-xs text-muted-foreground">Manually set values for test variables</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Optional</span>
                    <CollapsibleTrigger asChild>
                        <Switch id="show-test" checked={showTest} onCheckedChange={setShowTest} />
                    </CollapsibleTrigger>
                </div>
            </div>
            <p className="text-xs text-orange-500 mt-1">(If your request contains variables, you can manually set their values for testing purposes.)</p>
            <CollapsibleContent className="mt-4">
                {error && <div className={styles.warn}>⚠ {error}</div>}
                <Button disabled={busy || !url || (showBody && !!jsonError)} onClick={runTest} className="bg-green-600 hover:bg-green-700 text-white">
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Test the request
                </Button>
                {resp && (
                    <div className="border rounded-lg p-4 mt-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <span className={resp.statusCode >= 200 && resp.statusCode < 300 ? "text-green-500" : "text-red-500"}>HTTP {resp.statusCode}</span>
                                <span>{resp.latencyMs} ms</span>
                            </div>
                        </div>
                         <pre className="bg-muted p-2 rounded-md overflow-auto text-xs">{JSON.stringify(resp.body, null, 2)}</pre>
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>

    </div>
  )
}
