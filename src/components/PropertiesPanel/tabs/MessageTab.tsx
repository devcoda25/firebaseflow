import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'
import { WhatsAppRules } from '@/config/whatsapp-rules'
import type { MessageContext } from '../types'

export default function MessageTab({ waContext = 'template', channels }: { waContext?: MessageContext; channels?: string[] }) {
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

      <label className={styles.field}>
        <span className={styles.label}>Channel Override</span>
        <select {...register('channelOverride')} className={styles.select}>
          <option value="">— Default —</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Message Text</span>
        <textarea {...register('text')} rows={4} className={styles.textarea} placeholder="Type the message…"/>
        {errors.text && <span className={styles.err}>{String(errors.text.message)}</span>}
      </label>

      <div className={styles.rowHeader}>
        <h4 className={styles.subhead}>Quick Reply Buttons</h4>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => append({ id: crypto.randomUUID(), label: '' })}
          disabled={currentQr.length >= qrCap}
        >+ Add</button>
      </div>

      <ul className={styles.list}>
        {fields.map((f, i) => (
          <li key={f.id} className={styles.listItem}>
            <input
              className={styles.input}
              placeholder="Button label"
              {...register(`quickReplies.${i}.label` as const)}
              maxLength={WhatsAppRules.template.quickReplyLabelMaxChars}
            />
            <button type="button" className={styles.removeBtn} onClick={() => remove(i)} aria-label="Remove">✕</button>
            {errors.quickReplies?.[i]?.label && (
              <span className={styles.err}>{String(errors.quickReplies?.[i]?.label?.message)}</span>
            )}
          </li>
        ))}
      </ul>

      {over && <div className={styles.warn}>Too many quick replies for {waContext}. Remove {currentQr.length - qrCap}.</div>}

      {/* (Optional) Attachments */}
      <details className={styles.details}>
        <summary>Attachments (optional)</summary>
        <div className={styles.attachRow}>
          <span className={styles.muted}>Add media via API for now.</span>
        </div>
      </details>
    </div>
  )
}
