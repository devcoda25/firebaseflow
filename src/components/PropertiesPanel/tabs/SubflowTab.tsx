import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

const MappingList = ({ name, title, varLabel, valueLabel }: { name: string; title: string; varLabel: string; valueLabel: string; }) => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                            <Label>{varLabel}</Label>
                            <Input {...control.register(`${name}.${index}.var`)} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label>{valueLabel}</Label>
                            <Input {...control.register(`${name}.${index}.value`)} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ var: '', value: '' })}>+ Add Mapping</Button>
            </CardContent>
        </Card>
    )
}


export default function SubflowTab({ availableSubflows = [] as { id: string; name: string }[] }) {
  const { register, setValue } = useFormContext();

  return (
    <div className={styles.tabBody}>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Subflow</Label>
                <Select onValueChange={(v) => setValue('subflow.subflowId', v)}>
                    <SelectTrigger><SelectValue placeholder="— Pick subflow —" /></SelectTrigger>
                    <SelectContent>
                        {availableSubflows.map(sf => (
                            <SelectItem key={sf.id} value={sf.id}>{sf.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Mode</Label>
                <Select defaultValue="synchronous" onValueChange={(v) => setValue('subflow.mode', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="synchronous">Synchronous</SelectItem>
                        <SelectItem value="fire_and_forget">Fire & Forget</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        <MappingList
            name="subflow.inputMapping"
            title="Input Mapping (parent → child)"
            varLabel="Child Variable"
            valueLabel="Parent Value (e.g. {{email}})"
        />

        <MappingList
            name="subflow.returnMapping"
            title="Return Mapping (child → parent)"
            varLabel="Parent Variable"
            valueLabel="Child Value"
        />
    </div>
  )
}
