'use client';
import React, { useState } from 'react';
import { useFlowStore } from '@/store/flow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { aiContentEnhancement } from '@/ai/flows/ai-content-enhancement';
import { generateFlowSuggestions } from '@/ai/flows/ai-flow-suggestions';
import { Loader2 } from 'lucide-react';
import styles from '../properties-panel.module.css';

export default function AITab() {
  const { nodes, edges } = useFlowStore();
  const [content, setContent] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [flowDescription, setFlowDescription] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleEnhance = async () => {
    if (!content) return;
    setIsEnhancing(true);
    setEnhancedContent('');
    try {
      const result = await aiContentEnhancement({ content });
      setEnhancedContent(result.enhancedContent);
    } catch (error) {
      console.error(error);
      setEnhancedContent('Error enhancing content.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setSuggestions('');
    try {
      const flowData = JSON.stringify({ nodes, edges }, null, 2);
      const result = await generateFlowSuggestions({ flowDescription, flowData });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      setSuggestions('Error generating suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className={styles.tabBody}>
      <Card>
        <CardHeader>
          <CardTitle>Content Enhancement</CardTitle>
          <CardDescription>Improve grammar, clarity, and tone with AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="content-to-enhance">Original Content</Label>
            <Textarea
              id="content-to-enhance"
              placeholder="Enter content to enhance..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <Button onClick={handleEnhance} disabled={isEnhancing || !content}>
            {isEnhancing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enhance Content
          </Button>
          {enhancedContent && (
            <div className="mt-4 rounded-md border bg-muted p-4">
              <Label>Enhanced Content</Label>
              <p className="text-sm">{enhancedContent}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Flow Suggestions</CardTitle>
          <CardDescription>Get AI-driven recommendations to optimize your flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="flow-description">Flow Description</Label>
            <Textarea
              id="flow-description"
              placeholder="Briefly describe what this flow does..."
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleSuggest} disabled={isSuggesting || !flowDescription}>
            {isSuggesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Suggestions
          </Button>
          {suggestions && (
            <div className="mt-4 rounded-md border bg-muted p-4">
              <Label>Suggestions</Label>
              <p className="text-sm whitespace-pre-wrap">{suggestions}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
