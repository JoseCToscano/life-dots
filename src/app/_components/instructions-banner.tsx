import { FC, useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';

export const InstructionsBanner: FC<{ className?: string }> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has dismissed the instructions before
    const hasSeenInstructions = Cookies.get('hasSeenLifeDotsInstructions');
    if (!hasSeenInstructions) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    // Set cookie to expire in 365 days
    Cookies.set('hasSeenLifeDotsInstructions', 'true', { expires: 365 });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn("mb-8 rounded-lg border bg-card p-4 text-card-foreground", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Each dot represents a week. Hover over a dot to see the date range.
            Click a dot to add journal entries and reminders.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss instructions"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};