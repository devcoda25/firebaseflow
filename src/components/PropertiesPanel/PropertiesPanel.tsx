'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './properties-panel.module.css';

import { TAB_KEYS, type PropertiesPanelProps, type TabKey } from './types';
import {
  generalSchema,
  messageSchema,
  apiSchema,
  logicSchema,
  scheduleSchema,
  campaignSchema,
  aiSchema,
  handoffSchema,
  analyticsSchema,
  subflowSchema,
} from './schemas';
import GeneralTab from './tabs/GeneralTab';
import MessageTab from './tabs/MessageTab';
import APITab from './tabs/APITab';
import LogicTab from './tabs/LogicTab';
import ScheduleTab from './tabs/ScheduleTab';
import CampaignTab from './tabs/CampaignTab';
import AITab from './tabs/AITab';
import HandoffTab from './tabs/HandoffTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import SubflowTab from './tabs/SubflowTab';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/** Simple class combiner */
function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const TAB_LABEL: Record<TabKey, string> = {
  general: 'General',
  message: 'Message',
  api: 'API/Webhook',
  logic: 'Logic',
  schedule: 'Schedule',
  campaign: 'Campaign',
  ai: 'AI Assist',
  handoff: 'Handoff',
  analytics: 'Analytics',
  subflow: 'Sub‑flow',
};

const TAB_SCHEMA_MAP: Record<TabKey, any> = {
    general: generalSchema,
    message: messageSchema('template'), // default context
    api: apiSchema,
    logic: logicSchema,
    schedule: scheduleSchema,
    campaign: campaignSchema,
    ai: aiSchema,
    handoff: handoffSchema,
    analytics: analyticsSchema,
    subflow: subflowSchema,
}

const TAB_COMPONENTS: Record<TabKey, React.FC<any>> = {
    general: GeneralTab,
    message: MessageTab,
    api: APITab,
    logic: LogicTab,
    ai: AITab,
    schedule: ScheduleTab,
    campaign: CampaignTab,
    handoff: HandoffTab,
    analytics: AnalyticsTab,
    subflow: SubflowTab,
};


export default function PropertiesPanel({
  node,
  onSave,
  onClose,
  waContext = 'template',
  channels,
  open,
}: PropertiesPanelProps) {
  const visible = !!node && (open ?? true);
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const schema = useMemo(() => {
    if (activeTab === 'message') {
        return messageSchema(waContext);
    }
    return TAB_SCHEMA_MAP[activeTab];
  }, [activeTab, waContext]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: (node?.data as any) || {},
    mode: 'onChange',
  });

  useEffect(() => {
    methods.reset((node?.data as any) || {});
  }, [node?.id, methods]);

  const debouncedSave = useDebouncedCallback((vals: any) => {
    if (!node) return;
    onSave(node.id, vals);
  }, 400);

  useEffect(() => {
    const subscription = methods.watch((value) => {
        debouncedSave(value);
    });
    return () => subscription.unsubscribe();
  }, [methods.watch, debouncedSave]);

  if (!visible) return null;

  const TabContent = TAB_COMPONENTS[activeTab];
  const tabProps = {
    waContext,
    channels,
    // Add other props needed by specific tabs here
  };

  return (
    <aside className={styles.root} role="dialog" aria-label="Node properties" aria-modal="true">
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Properties</h2>
          <p className={styles.subtitle}>{node?.data?.label ?? node?.id}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close properties">
          <X />
        </Button>
      </div>

      <FormProvider {...methods}>
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabKey)} className="w-full p-2 overflow-auto">
            <TabsList className="grid w-full grid-cols-3">
                {TAB_KEYS.map((k) => (
                    <TabsTrigger key={k} value={k}>
                        {TAB_LABEL[k]}
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value={activeTab}>
                <TabContent {...tabProps} />
            </TabsContent>
        </Tabs>
      </FormProvider>

      <div className={styles.footer}>
        <ValidationSummary errors={methods.formState.errors} />
      </div>
    </aside>
  );
}

function ValidationSummary({ errors }: { errors: Record<string, any> }) {
    const errorMessages = Object.values(errors).map((e: any) => e.message).filter(Boolean);
    if (errorMessages.length === 0) return <span className={styles.ok}>All good ✓</span>
    
    return (
        <ul className={styles.problems} aria-live="polite">
        {errorMessages.map((msg, i) => (
            <li key={i} className={styles.problemItem}>
            ⚠ {String(msg)}
            </li>
        ))}
        </ul>
    );
}
