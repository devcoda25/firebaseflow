import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import KeyValueEditor from '@/components/KeyValueEditor/KeyValueEditor';
import VariableChipAutocomplete from '@/components/VariableChipAutocomplete/VariableChipAutocomplete';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsTab({ variables = [] as string[] }) {
  const { register, control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'analytics.properties' });
  const sampleRate = watch('analytics.sampleRate', 1);
  const includedVars = watch('analytics.includeVars', []);

  return (
    <div className={styles.tabBody}>
      <div className="space-y-2">
        <Label htmlFor="eventName">Event Name</Label>
        <Input id="eventName" placeholder="flow.node.completed" {...register('analytics.eventName')} />
      </div>

      <KeyValueEditor
        label="Properties"
        items={fields as any[]}
        onChange={(list) => setValue('analytics.properties', list, { shouldDirty: true })}
      />

      <div className="space-y-2">
        <Label>Sample Rate ({sampleRate})</Label>
        <Slider
          defaultValue={[sampleRate]}
          max={1}
          step={0.05}
          onValueChange={(val) => setValue('analytics.sampleRate', val[0])}
        />
      </div>

      <div className="space-y-2">
        <Label>Include Variables</Label>
        <VariableChipAutocomplete
          variables={variables}
          onInsert={(name) => {
            const current: string[] = watch('analytics.includeVars') || [];
            if (!current.includes(name)) setValue('analytics.includeVars', [...current, name]);
          }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
            {includedVars.map((v: string) => <Badge key={v} variant="secondary">{v}</Badge>)}
        </div>
      </div>
    </div>
  );
}
