import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function LogicTab() {
  const { register, formState: { errors } } = useFormContext()
  return (
    <div className={styles.tabBody}>
      <label className={styles.field}>
        <span className={styles.label}>Expression</span>
        <textarea {...register('expression')} rows={5} className={styles.textarea} placeholder="user.age > 18 && country === 'US'"/>
        {errors.expression && <span className={styles.err}>{String(errors.expression.message)}</span>}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Default Branch (optional)</span>
        <input {...register('defaultBranch')} className={styles.input} placeholder="e.g. 'else'"/>
      </label>
    </div>
  )
}
