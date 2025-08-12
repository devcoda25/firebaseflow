import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { XIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HandoffTab() {
  const { register, setValue, watch } = useFormContext();
  const [tagInput, setTagInput] = useState('');
  const tags = (watch('handoff.tags') as string[]) || [];

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setValue('handoff.tags', [...tags, t]);
    setTagInput('');
  };
  const rmTag = (t: string) => setValue('handoff.tags', tags.filter(x => x !== t));

  return (
    <div className={styles.tabBody}>
      <Card>
        <CardHeader><CardTitle>Routing</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Queue ID</Label>
            <Input placeholder="sales-queue" {...register('handoff.queueId')} />
          </div>
          <div className="space-y-2">
            <Label>Team ID</Label>
            <Input placeholder="team-apac" {...register('handoff.teamId')} />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select defaultValue="normal" onValueChange={(v) => setValue('handoff.priority', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assignment</Label>
            <Select defaultValue="round_robin" onValueChange={(v) => setValue('handoff.assignment', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="least_busy">Least Busy</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timeout</Label>
            <Input placeholder="e.g. 5m" {...register('handoff.timeout')} />
          </div>
          <div className="space-y-2">
            <Label>Fallback</Label>
            <Select defaultValue="return_to_bot" onValueChange={(v) => setValue('handoff.fallback', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="return_to_bot">Return to Bot</SelectItem>
                    <SelectItem value="voicemail">Voicemail</SelectItem>
                    <SelectItem value="end_session">End Session</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Context</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag" />
              <Button type="button" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(t => (
                <Badge key={t} variant="secondary" className="flex items-center gap-1">
                  {t} <XIcon className="h-3 w-3 cursor-pointer" onClick={() => rmTag(t)} />
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea className="mt-2" rows={3} placeholder="Context for the agent…" {...register('handoff.note')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
