import React from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import localStyles from './LogicTab.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

function ConditionEditor({ branchIndex }: { branchIndex: number }) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `branches.${branchIndex}.conditions`
  });

  return (
    <div className={localStyles.conditionGroup}>
      {fields.map((field, conditionIndex) => (
        <React.Fragment key={field.id}>
            <div className={localStyles.conditionRow}>
                <div className={localStyles.ifClause}>
                    {conditionIndex === 0 ? 'IF' : 'AND'}
                </div>
                <div className="flex-grow grid gap-2">
                    <Controller
                        control={control}
                        name={`branches.${branchIndex}.conditions.${conditionIndex}.variable`}
                        render={({ field }) => (
                           <div className="flex gap-2">
                             <Input {...field} placeholder="Variable (e.g. user.country)" />
                             <Button type="button" variant="outline" className="bg-green-500 hover:bg-green-600 text-white">Variables</Button>
                           </div>
                        )}
                    />
                     <Controller
                        control={control}
                        name={`branches.${branchIndex}.conditions.${conditionIndex}.operator`}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equal_to">Is equal to</SelectItem>
                                    <SelectItem value="not_equal_to">Is not equal to</SelectItem>
                                    <SelectItem value="greater_than">Is greater than</SelectItem>
                                    <SelectItem value="less_than">Is less than</SelectItem>
                                    <SelectItem value="contains">Contains</SelectItem>
                                    <SelectItem value="starts_with">Starts with</SelectItem>
                                    <SelectItem value="ends_with">Ends with</SelectItem>
                                    <SelectItem value="is_defined">Is defined</SelectItem>
                                    <SelectItem value="is_not_defined">Is not defined</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                     <Controller
                        control={control}
                        name={`branches.${branchIndex}.conditions.${conditionIndex}.value`}
                        render={({ field }) => (
                           <div className="flex gap-2">
                             <Input {...field} placeholder="Value" />
                             <Button type="button" variant="outline" className="bg-green-500 hover:bg-green-600 text-white">Variables</Button>
                           </div>
                        )}
                    />
                </div>
                <Button type="button" variant="ghost" size="icon" className="self-center shrink-0" onClick={() => remove(conditionIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </React.Fragment>
      ))}
      <Button
        type="button"
        variant="outline"
        className={localStyles.addButton}
        onClick={() => append({ variable: '', operator: 'equal_to', value: '' })}
      >
        + AND
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
        <ScrollArea className="h-full max-h-[500px] pr-4">
            <ul className={cn(styles.list, "space-y-4")}>
                {fields.map((field, index) => (
                <li key={field.id}>
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow space-y-2">
                            <Label>Branch Name</Label>
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
                          <ConditionEditor branchIndex={index} />
                          <FormMessage>{(errors?.branches as any)?.[index]?.conditions?.message}</FormMessage>
                      </div>
                    </CardContent>
                  </Card>
                </li>
                ))}
            </ul>
        </ScrollArea>
        {errors.branches && typeof errors.branches.message === 'string' && <p className={styles.err}>{errors.branches.message}</p>}
      
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => append({ id: nanoid(), label: `Branch ${fields.length + 1}`, conditions: [{ variable: '', operator: 'equal_to', value: '' }] })}
        >+ Add Branch</Button>
    </div>
  );
}
