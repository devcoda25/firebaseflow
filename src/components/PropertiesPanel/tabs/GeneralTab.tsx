import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function GeneralTab() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className={styles.tabBody}>
      <label className={styles.field}>
        <span className={styles.label}>Label</span>
        <input {...register('label')} className={styles.input}/>
        {errors.label && <span className={styles.err}>{String(errors.label.message)}</span>}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Icon (emoji)</span>
        <input {...register('icon')} className={styles.input}/>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Channel Override</span>
        <select {...register('channel')} className={styles.select}>
          <option value="">— Default —</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </select>
      </label>
    </div>
  )
}
