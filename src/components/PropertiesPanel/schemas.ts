import { z } from 'zod';
import { WhatsAppRules } from '@/config/whatsapp-rules';
import type { MessageContext } from './types';

// ---- General
export const generalSchema = z.object({
  label: z.string().min(1, 'Label required'),
  icon: z.string().optional(),
});

// ---- Message
export function messageSchema(waCtx: MessageContext) {
  const qrCap = waCtx === 'template' ? WhatsAppRules.template.quickReplyMax : WhatsAppRules.interactive.replyButtonsInSessionMax;

  return z.object({
    text: z.string().min(1, 'Message text required').max(4096),
    quickReplies: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string()
          .min(1, 'Label required')
          .max(WhatsAppRules.template.quickReplyLabelMaxChars, `Max ${WhatsAppRules.template.quickReplyLabelMaxChars} chars`),
      })
    ).max(qrCap, `Too many quick replies for ${waCtx}. Max ${qrCap}.`).optional(),
  });
}

// ---- API
export const apiSchema = z.object({
    method: z.enum(['GET','POST','PUT','PATCH','DELETE']).default('POST'),
    url: z.string().url('Valid URL required'),
    headers: z.array(z.object({ key: z.string().min(1), value: z.string() })).optional(),
    body: z.string().optional().refine((val) => {
      if (!val || val.trim() === '') return true;
      try { JSON.parse(val) } catch { return false }
      return true;
    }, 'Body must be valid JSON')
});

// ---- Logic
const conditionSchema = z.object({
  variable: z.string().min(1, 'Variable is required.'),
  operator: z.string().min(1, 'Operator is required.'),
  value: z.string().min(1, 'Value is required.'),
});

const conditionGroupSchema = z.object({
  type: z.enum(['and', 'or']),
  conditions: z.array(conditionSchema),
});

export const logicSchema = z.object({
    groups: z.array(conditionGroupSchema).min(1, 'At least one condition group is required.'),
});


// ---- Schedule
export const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24h HH:MM');
export const dayEnum = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
export const scheduleSchema = z.object({
  delay: z.string().optional(),
  timezone: z.string().default('UTC'),
  days: z.array(dayEnum).min(1, 'Pick at least one day'),
  windowStart: hhmm,
  windowEnd: hhmm,
  respectQuietHours: z.boolean().default(true),
});

// ---- Campaign
export const channelEnum = z.enum([
  'whatsapp','sms','email','push','voice','instagram','messenger','webchat','slack','teams','telegram'
]);
export const campaignSchema = z.object({
  audienceTags: z.array(z.string().min(1)).default([]),
  channels: z.array(channelEnum).min(1, 'Pick at least one channel'),
  frequencyCap: z.object({
    count: z.number().int().min(1).max(100),
    per: z.enum(['day','week','month']),
  }),
});

// ---- AI Assist
export const aiSchema = z.object({
  provider: z.enum(['openai','azure_openai','anthropic','custom']),
  model: z.string().min(1, 'Model required'),
  credentialId: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  prompt: z.string().min(1, 'Prompt required'),
});

// ---- Handoff
export const handoffSchema = z.object({
  queueId: z.string().optional(),
  teamId: z.string().optional(),
  priority: z.enum(['low','normal','high','urgent']).default('normal'),
});

// ---- Analytics
export const kvRow = z.object({ key: z.string().min(1), value: z.string() });
export const analyticsSchema = z.object({
  eventName: z.string().min(1, 'Event name required'),
  properties: z.array(kvRow).default([]),
});

// ---- Subflow
export const mappingRow = z.object({ var: z.string().min(1), value: z.string().min(1) });
export const subflowSchema = z.object({
  subflowId: z.string().min(1, 'Pick a subflow'),
  mode: z.enum(['synchronous','fire_and_forget']).default('synchronous'),
  inputMapping: z.array(mappingRow).default([]),
  returnMapping: z.array(mappingRow).default([]),
});
