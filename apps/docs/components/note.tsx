import { AlertTriangleIcon, CheckCheckIcon, InfoIcon, OctagonAlertIcon } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type NoteProps = PropsWithChildren & {
  title?: string;
  type?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
};

export default function Note({
  children,
  title = 'Note',
  type = 'default',
}: NoteProps) {
  return (
    <Alert variant={type}>
      {type === 'info' && <InfoIcon className='w-4 h-4' />}
      {type === 'success' && <CheckCheckIcon className='w-4 h-4' />}
      {type === 'warning' && <AlertTriangleIcon className='w-4 h-4' />}
      {type === 'destructive' && <OctagonAlertIcon className='w-4 h-4' />}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
