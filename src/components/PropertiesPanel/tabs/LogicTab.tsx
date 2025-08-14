import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import ExpressionBuilder from '@/components/ExpressionBuilder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

export default function LogicTab() {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'branches'
  });

  const variables = [
      { name: 'user.name', type: 'string', label: 'User Name' },
      { name: 'user.email', type: 'string', label: 'User Email' },
      { name: 'user.age', type: 'number', label: 'User Age' },
      { name: 'last_message', type: 'string', label: 'Last Message' },
  ];

  return (
    <div className={styles.tabBody}>
      <div className={styles.field}>
        <div className={styles.rowHeader}>
            <h4 className={styles.subhead}>Conditional Branches</h4>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className={styles.addBtn}
                onClick={() => append({ id: nanoid(), label: `Branch ${fields.length + 1}`, condition: '' })}
            >+ Add Branch</Button>
        </div>
        
        {fields.length === 0 && (
          <p className={styles.muted}>No branches defined. The node will act as a simple True/False split based on the main expression.</p>
        )}

        <ul className={`${styles.list} mt-4`}>
            {fields.map((field, index) => (
              <li key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-grow space-y-2">
                     <Label>Branch Label</Label>
                     <Input 
                       {...control.register(`branches.${index}.label`)}
                       placeholder="e.g. US Customer"
                     />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className={`${styles.removeBtn} ml-2`} onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                    <Label>Condition</Label>
                    <ExpressionBuilder
                        value={(field as any).condition}
                        onChange={(val) => update(index, { ...field, condition: val })}
                        variables={variables}
                        height={120}
                        initialTestContext={{ user: { age: 25 }, last_message: 'Hello' }}
                    />
                </div>
              </li>
            ))}
        </ul>
        {errors.branches && <span className={styles.err}>{String((errors.branches as any).message || (errors.branches as any).root?.message)}</span>}
      </div>
    </div>
  );
}
