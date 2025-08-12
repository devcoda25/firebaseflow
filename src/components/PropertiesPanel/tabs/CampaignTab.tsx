import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { XIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CHANNELS = ['whatsapp','sms','email','push','voice','instagram','messenger','webchat','slack','teams','telegram'] as const;

export default function CampaignTab() {
  const { register, setValue, watch } = useFormContext();
  const picks = new Set((watch('campaign.channels') as string[]) || []);
  const [tagInput, setTagInput] = useState('');

  const toggleChannel = (c: string) => {
    const arr = Array.from(picks);
    if (picks.has(c)) setValue('campaign.channels', arr.filter(x => x !== c));
    else setValue('campaign.channels', [...arr, c]);
  };

  const tags = (watch('campaign.audienceTags') as string[]) || [];
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setValue('campaign.audienceTags', [...tags, t]);
    setTagInput('');
  };
  const rmTag = (t: string) => setValue('campaign.audienceTags', tags.filter(x => x !== t));

  return (
    <div className={styles.tabBody}>
      <Card>
        <CardHeader><CardTitle>Audience</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Type and press Add" />
            <Button onClick={addTag} type="button">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <Badge key={t} variant="secondary" className="flex items-center gap-1">
                {t} <XIcon className="h-3 w-3 cursor-pointer" onClick={() => rmTag(t)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Channels</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            {CHANNELS.map(c => (
              <div key={c} className="flex items-center space-x-2">
                <Checkbox id={`campaign-channel-${c}`} checked={picks.has(c)} onCheckedChange={() => toggleChannel(c)} />
                <label htmlFor={`campaign-channel-${c}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{c}</label>
              </div>
            ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Send Rules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency Cap</Label>
              <Input type="number" min={1} max={100} {...register('campaign.frequencyCap.count', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Per</Label>
              <Select defaultValue="day" {...register('campaign.frequencyCap.per')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="deduplicate" {...register('campaign.deduplicate')} />
            <Label htmlFor="deduplicate">Deduplicate recipients</Label>
          </div>
           <div className="flex items-center space-x-2">
            <Checkbox id="trackUTM" {...register('campaign.trackUTM')} />
            <Label htmlFor="trackUTM">Append UTM parameters</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
