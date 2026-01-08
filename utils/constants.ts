import {
  MessageCircle, Monitor, Target, Coffee,
} from 'lucide-react';

export const TOPIC_TYPES = {
  discussion: { label: 'Discussion', variant: 'discussion', barColor: 'bg-green-500', icon: MessageCircle },
  presentation: { label: 'Presentation', variant: 'presentation', barColor: 'bg-blue-500', icon: Monitor },
  decision: { label: 'Decision', variant: 'decision', barColor: 'bg-yellow-500', icon: Target },
  break: { label: 'Break', variant: 'break', barColor: 'bg-slate-500', icon: Coffee },
} as const;