import React from 'react';
import { useFormContext } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import ExpressionBuilder from '@/components/ExpressionBuilder';

export default function LogicTab() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const expression = watch('expression', '');
  
  // This is a mock list of variables. In a real app, this would come from the flow context.
  const variables = [
      { name: 'user.name', type: 'string', label: 'User Name' },
      { name: 'user.email', type: 'string', label: 'User Email' },
      { name: 'user.age', type: 'number', label: 'User Age' },
      { name: 'last_message', type: 'string', label: 'Last Message' },
  ];

  return (
    <div className={styles.tabBody}>
        <ExpressionBuilder
            value={expression}
            onChange={(val) => setValue('expression', val, { shouldDirty: true })}
            variables={variables}
            height={200}
            initialTestContext={{ user: { age: 25 }, last_message: 'Hello' }}
        />
        {errors.expression && <span className={styles.err}>{String(errors.expression.message)}</span>}
    </div>
  );
}
