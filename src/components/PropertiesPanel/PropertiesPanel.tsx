'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './properties-panel.module.css';
import { z } from 'zod';

import { type PropertiesPanelProps, type TabKey, TABS_FOR_NODE_TYPE } from './types';
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
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
  channels
}: PropertiesPanelProps) {
  const nodeType = node?.data?.type || 'end';
  const availableTabs = TABS_FOR_NODE_TYPE[nodeType] || [];
  
  const [activeTab, setActiveTab] = useState<TabKey | undefined>(availableTabs[0]);

  const schema = useMemo(() => {
    if (!activeTab) return z.object({});
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
    setActiveTab(availableTabs[0]);
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
  
  useEffect(() => {
    if (!availableTabs.includes(activeTab as TabKey)) {
        setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);


  if (!node) return null;

  if (availableTabs.length === 0) {
    return (
       <DialogContent className={styles.root}>
        <DialogHeader>
            <DialogTitle>Properties: {node?.data?.label ?? node?.id}</DialogTitle>
            <DialogDescription>
                This node has no configurable properties.
            </DialogDescription>
        </DialogHeader>
         <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    )
  }

  const TabContent = activeTab ? TAB_COMPONENTS[activeTab] : null;
  const tabProps = {
    waContext,
    channels,
    // Add other props needed by specific tabs here
  };

  return (
    <DialogContent className={styles.root}>
        <DialogHeader>
            <DialogTitle>Properties: {node?.data?.label ?? node?.id}</DialogTitle>
            <DialogDescription>
                Configure the behavior of this node. Changes are saved automatically.
            </DialogDescription>
        </DialogHeader>

      <FormProvider {...methods}>
        <div className={styles.body}>
          {availableTabs.length > 1 ? (
             <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabKey)} className="w-full flex flex-col min-h-0">
                <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
                    {availableTabs.map((k) => (
                        <TabsTrigger key={k} value={k}>
                            {TAB_LABEL[k]}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {TabContent && (
                  <TabsContent value={activeTab!} className={styles.tabContent}>
                      <TabContent {...tabProps} />
                  </TabsContent>
                )}
            </Tabs>
          ) : (
             TabContent && <div className={styles.tabContent}><TabContent {...tabProps} /></div>
          )}
        </div>
      </FormProvider>

      <DialogFooter className={styles.footer}>
        <ValidationSummary errors={methods.formState.errors} />
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
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
