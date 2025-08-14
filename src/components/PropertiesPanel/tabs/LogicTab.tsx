import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import localStyles from './LogicTab.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, HelpCircle } from 'lucide-react';
import { nanoid } from 'nanoid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

function ConditionEditor({ branchIndex }: { branchIndex: number }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `branches.${branchIndex}.conditions`
  });

  return (
    <div className={localStyles.conditionGroup}>
      {fields.map((field, conditionIndex) => (
        <div key={field.id} className={localStyles.conditionRow}>
          <div className={localStyles.ifClause}>
             {conditionIndex === 0 ? 'IF' : 'AND'}
          </div>
          <div className="flex-grow space-y-2">
            <div className="flex gap-2">
              <div className={localStyles.inputWithIcon}>
                <HelpCircle className={localStyles.inputIcon} />
                <Input 
                  {...control.register(`branches.${branchIndex}.conditions.${conditionIndex}.variable`)}
                  placeholder="age"
                  className="pl-8"
                />
              </div>
              <Button type="button" variant="outline" className={localStyles.variablesButton}>Variables</Button>
            </div>
            <Select
              onValueChange={(value) => control.setValue(`branches.${branchIndex}.conditions.${conditionIndex}.operator`, value)}
              defaultValue={(field as any).operator}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal_to">Equal to</SelectItem>
                <SelectItem value="not_equal_to">Not equal to</SelectItem>
                <SelectItem value="greater_than">Greater than</SelectItem>
                <SelectItem value="less_than">Less than</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
              </SelectContent>
            </Select>
             <div className="flex gap-2">
              <Input
                {...control.register(`branches.${branchIndex}.conditions.${conditionIndex}.value`)}
                placeholder="30"
              />
              <Button type="button" variant="outline" className={localStyles.variablesButton}>Variables</Button>
            </div>
          </div>
          {fields.length > 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(conditionIndex)} className="self-center">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className={localStyles.addButton}
        onClick={() => append({ id: nanoid(), variable: '', operator: 'equal_to', value: '' })}
      >
        +Add
      </Button>
    </div>
  );
}

export default function LogicTab() {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'branches'
  });

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
                onClick={() => append({ id: nanoid(), label: `Branch ${fields.length + 1}`, conditions: [{ id: nanoid(), variable: '', operator: 'equal_to', value: '' }] })}
            >+ Add Branch</Button>
        </div>
        
        {fields.length === 0 && (
          <p className={styles.muted}>No branches defined. Click "+ Add Branch" to create one.</p>
        )}

        <ScrollArea className="h-full max-h-[400px] pr-4 mt-4">
            <ul className={cn(styles.list, "space-y-4")}>
                {fields.map((field, index) => (
                <li key={field.id} className="p-4 border rounded-lg space-y-4 bg-card">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow space-y-2">
                          <Label>Branch Label</Label>
                          <Input 
                            {...control.register(`branches.${index}.label`)}
                            placeholder="e.g. US Customer"
                          />
                          <FormMessage>{(errors?.branches as any)?.[index]?.label?.message}</FormMessage>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className={`${styles.removeBtn} ml-2`} onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Set the condition(s)</Label>
                        <ConditionEditor branchIndex={index} />
                        <FormMessage>{(errors?.branches as any)?.[index]?.condition?.message}</FormMessage>
                    </div>
                </li>
                ))}
            </ul>
        </ScrollArea>
        {errors.branches && typeof errors.branches.message === 'string' && <p className={styles.err}>{errors.branches.message}</p>}
      </div>
    </div>
  );
}
