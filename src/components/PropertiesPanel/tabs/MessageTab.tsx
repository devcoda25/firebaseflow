import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'
import { WhatsAppRules } from '@/config/whatsapp-rules'
import type { MessageContext } from '../types'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

export default function MessageTab({ waContext = 'template' }: { waContext?: MessageContext; channels?: string[] }) {
  const { register, control, formState: { errors }, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'quickReplies' })
  const qrCap = waContext === 'template'
    ? WhatsAppRules.template.quickReplyMax
    : WhatsAppRules.interactive.replyButtonsInSessionMax

  const currentQr = watch('quickReplies') ?? []
  const over = currentQr.length > qrCap

  return (
    <div className={styles.tabBody}>
      <div className={styles.infoRow}>
        <span className={styles.badge}>WA {waContext}</span>
        <span className={styles.muted}>Quick replies limit: {qrCap}</span>
      </div>

      <FormField
        control={control}
        name="text"
        render={({ field }) => (
          <FormItem className={styles.field}>
            <Label>Message Text</Label>
            <FormControl>
              <Textarea {...field} rows={4} placeholder="Type the message…" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className={styles.field}>
        <div className={styles.rowHeader}>
            <h4 className={styles.subhead}>Quick Reply Buttons</h4>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className={styles.addBtn}
                onClick={() => append({ id: crypto.randomUUID(), label: '' })}
                disabled={currentQr.length >= qrCap}
            >+ Add</Button>
        </div>

        <ul className={styles.list}>
            {fields.map((f, i) => (
            <li key={f.id} className={styles.listItem}>
                <Input
                placeholder="Button label"
                {...register(`quickReplies.${i}.label` as const)}
                maxLength={WhatsAppRules.template.quickReplyLabelMaxChars}
                />
                <Button type="button" variant="ghost" size="icon" className={styles.removeBtn} onClick={() => remove(i)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </li>
            ))}
        </ul>
        {errors.quickReplies && typeof errors.quickReplies.message === 'string' && <p className={styles.err}>{errors.quickReplies.message}</p>}

        {over && <div className={styles.warn}>Too many quick replies for {waContext}. Remove {currentQr.length - qrCap}.</div>}
      </div>
    </div>
  )
}
