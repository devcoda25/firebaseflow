import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

export default function GeneralTab() {
  const { control } = useFormContext()

  return (
    <div className={styles.tabBody}>
      <FormField
        control={control}
        name="label"
        render={({ field }) => (
          <FormItem className={styles.field}>
            <Label>Label</Label>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="icon"
        render={({ field }) => (
          <FormItem className={styles.field}>
            <Label>Icon (emoji)</Label>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
