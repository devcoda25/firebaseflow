'use client';
import React from 'react';
import styles from '../test-console.module.css';
import type { Channel, EngineStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, SkipForward, RotateCcw, FileText, Eraser, Binary } from 'lucide-react';

function cn(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' '); }

export default function Toolbar({
  channel, setChannel,
  status,
  onPlay, onPause, onStep, onRestart,
  onClearChat, onClearTrace,
  onToggleContext, onExportTrace,
}: {
  channel: Channel;
  setChannel: (c: Channel) => void;
  status: EngineStatus;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onRestart: () => void;
  onClearChat: () => void;
  onClearTrace: () => void;
  onToggleContext: () => void;
  onExportTrace: () => void;
}) {
  const CHANNELS: Channel[] = ['whatsapp','sms','email','push','voice','slack','teams','telegram'];
  const busy = status === 'running';

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <Select value={channel} onValueChange={(v: Channel) => setChannel(v)}>
            <SelectTrigger className="w-[120px] h-8">
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {CHANNELS.map(ch => <SelectItem key={ch} value={ch}>{ch.toUpperCase()}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>

      <div className={styles.group}>
        {status !== 'running' ? (
          <Button size="sm" variant="outline" onClick={onPlay} disabled={busy}><Play className="h-4 w-4 mr-1"/> Play</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onPause} disabled={!busy}><Pause className="h-4 w-4 mr-1"/> Pause</Button>
        )}
        <Button size="sm" variant="outline" onClick={onStep} disabled={busy}><SkipForward className="h-4 w-4 mr-1"/> Step</Button>
        <Button size="sm" variant="outline" onClick={onRestart}><RotateCcw className="h-4 w-4 mr-1"/> Restart</Button>
      </div>

      <div className={styles.group}>
        <Button size="sm" variant="outline" onClick={onToggleContext}><Binary className="h-4 w-4 mr-1"/> Context</Button>
        <Button size="sm" variant="outline" onClick={onExportTrace}><FileText className="h-4 w-4 mr-1"/> Export</Button>
        <Button size="sm" variant="outline" onClick={onClearChat}><Eraser className="h-4 w-4 mr-1"/> Chat</Button>
        <Button size="sm" variant="outline" onClick={onClearTrace}><Eraser className="h-4 w-4 mr-1"/> Trace</Button>
      </div>

      <span className={cn(styles.badge, status === 'running' && styles.badgeGreen, status === 'paused' && styles.badgeOrange)}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}
