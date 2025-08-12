import React from 'react';
import { useFormContext } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TZ = ['UTC','Europe/London','America/New_York','America/Los_Angeles','Africa/Nairobi','Asia/Kolkata','Asia/Singapore'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;

export default function ScheduleTab() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const selectedDays = new Set((watch('schedule.days') as string[]) || []);

  const toggleDay = (day: string) => {
    const currentDays = new Set(watch('schedule.days') || []);
    if (currentDays.has(day)) {
        currentDays.delete(day);
    } else {
        currentDays.add(day);
    }
    setValue('schedule.days', Array.from(currentDays), { shouldValidate: true });
  }

  return (
    <div className={styles.tabBody}>
      <div className="space-y-2">
        <Label>Delay before next</Label>
        <Input placeholder="e.g. 30m, 5s, 1h" {...register('schedule.delay')} />
      </div>

      <div className="space-y-2">
        <Label>Timezone</Label>
        <Select defaultValue="UTC" onValueChange={(v) => setValue('schedule.timezone', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TZ.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Send Window</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Days</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {DAYS.map(d => (
                <div key={d} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${d}`}
                    checked={selectedDays.has(d)}
                    onCheckedChange={() => toggleDay(d)}
                  />
                  <label htmlFor={`day-${d}`} className="text-sm font-medium leading-none">{d}</label>
                </div>
              ))}
            </div>
            {errors?.schedule?.days && <p className={styles.err}>Please select at least one day.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start (HH:MM)</Label>
              <Input placeholder="09:00" {...register('schedule.windowStart')} />
            </div>
            <div className="space-y-2">
              <Label>End (HH:MM)</Label>
              <Input placeholder="18:00" {...register('schedule.windowEnd')} />
            </div>
          </div>
           <div className="flex items-center space-x-2">
            <Checkbox id="respectQuietHours" {...register('schedule.respectQuietHours')} />
            <Label htmlFor="respectQuietHours">Respect quiet hours</Label>
          </div>
          <p className="text-xs text-muted-foreground">Messages outside the window will be sent at the next available time.</p>
        </CardContent>
      </Card>
    </div>
  )
}
