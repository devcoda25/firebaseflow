import React from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import localStyles from './LogicTab.module.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle, Copy } from 'lucide-react';
import { nanoid } from 'nanoid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function ConditionRow({ groupIndex, conditionIndex, onRemove }: { groupIndex: number, conditionIndex: number, onRemove: () => void }) {
  const { control, register } = useFormContext();
  return (
    <div className={localStyles.conditionRow}>
      <Controller
        control={control}
        name={`groups.${groupIndex}.conditions.${conditionIndex}.variable`}
        render={({ field }) => <Input {...field} placeholder="Variable e.g. {{name}}" />}
      />
      <Controller
        control={control}
        name={`groups.${groupIndex}.conditions.${conditionIndex}.operator`}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger><SelectValue placeholder="Operator" /></SelectTrigger>
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
        name={`groups.${groupIndex}.conditions.${conditionIndex}.value`}
        render={({ field }) => <Input {...field} placeholder="Value" />}
      />
      <Button type="button" variant="ghost" size="icon" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
    </div>
  );
}

function ConditionGroup({ groupIndex, onRemoveGroup, onCopyGroup }: { groupIndex: number, onRemoveGroup: () => void, onCopyGroup: () => void }) {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `groups.${groupIndex}.conditions`
  });
  const groupType = watch(`groups.${groupIndex}.type`);

  return (
    <Card className={localStyles.conditionGroup}>
      <CardHeader className="flex-row items-center justify-between p-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Condition Group</CardTitle>
          <CardDescription className="text-xs">All conditions in this group must be met.</CardDescription>
        </div>
        <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={onCopyGroup}><Copy className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={onRemoveGroup}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {fields.map((field, conditionIndex) => (
          <ConditionRow
            key={field.id}
            groupIndex={groupIndex}
            conditionIndex={conditionIndex}
            onRemove={() => remove(conditionIndex)}
          />
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ variable: '', operator: 'equal_to', value: '' })} className="gap-2">
          <PlusCircle className="h-4 w-4" /> AND
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LogicTab() {
  const { control, setValue } = useFormContext();
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: 'groups'
  });

  const addGroup = () => append({ type: 'and', conditions: [{ variable: '', operator: 'equal_to', value: '' }] });
  const copyGroup = (index: number) => {
    const groupToCopy = (control as any)._getWatch('groups')[index];
    insert(index + 1, { ...groupToCopy, id: nanoid() });
  }

  return (
    <div className={styles.tabBody}>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            {index > 0 && <div className={localStyles.orDivider}>OR</div>}
            <ConditionGroup
              groupIndex={index}
              onRemoveGroup={() => remove(index)}
              onCopyGroup={() => copyGroup(index)}
            />
          </React.Fragment>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 gap-2"
        onClick={addGroup}
      >
        <PlusCircle className="h-4 w-4" /> Add OR Condition Group
      </Button>
    </div>
  );
}
