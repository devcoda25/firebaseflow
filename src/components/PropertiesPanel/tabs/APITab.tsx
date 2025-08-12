import React, { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import CodeMirror from '@uiw/react-codemirror'
import { json as cmJson } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import styles from '../properties-panel.module.css'
import { sendTestRequest } from '@/api/mockServer'
import KeyValueEditor from '@/components/KeyValueEditor/KeyValueEditor'
import CredentialSelector from '@/components/CredentialSelector/CredentialSelector'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCredentialVault } from '@/cred/useCredentials'
import { Loader2 } from 'lucide-react'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export default function APITab() {
  const { register, watch, setValue } = useFormContext()
  const { resolve } = useCredentialVault();

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resp, setResp] = useState<any>(null)
  const [respTab, setRespTab] = useState<'body'|'headers'|'raw'>('body')

  const url = watch('url')
  const method = watch('method', 'POST')
  const query = watch('query', [])
  const headers = watch('headers', [])
  const body = watch('body', '')
  const auth = watch('auth', {type: 'none'})

  const jsonError = useMemo(() => {
    if (!body || body.trim() === '') return null
    try { JSON.parse(body) } catch (e: any) { return e?.message || 'Invalid JSON' }
    return null
  }, [body])

  async function handleCredentialChange(id?: string) {
    setValue('auth.credentialId', id)
    if(!id) {
        setValue('auth', {type: 'none'})
        return
    }
    const secret = await resolve(id)
    // You would fetch the full credential summary here to get its type
    // For now, we'll assume the type from the secret shape
    if (secret.token) {
        setValue('auth', {type: 'bearer', token: secret.token, credentialId: id})
    } else if (secret.username) {
        setValue('auth', {type: 'basic', ...secret, credentialId: id})
    } else if (secret.key) {
        setValue('auth', {type: 'apiKey', ...secret, credentialId: id})
    }
  }

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
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={(v) => setValue('method', v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {(['GET','POST','PUT','PATCH','DELETE'] as Method[]).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label>Credential</Label>
                <CredentialSelector value={auth.credentialId} onChange={handleCredentialChange} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor='url'>URL</Label>
            <Input id="url" {...register('url')} />
        </div>
        <KeyValueEditor label="Query Params" items={query} onChange={(v) => setValue('query', v)} />
        <KeyValueEditor label="Headers" items={headers} onChange={(v) => setValue('headers', v)} />

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

        {error && <div className={styles.warn}>⚠ {error}</div>}
        <Button disabled={busy || !url || !!jsonError} onClick={runTest}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Send Test Request
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
    </div>
  )
}
