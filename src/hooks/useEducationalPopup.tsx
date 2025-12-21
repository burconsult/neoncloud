import { useState, useCallback } from 'react';
import { EducationalPopup, PopupType } from '@/components/educational/EducationalPopup';
import { useEducationalStore } from '@/game/state/useEducationalStore';

interface PopupConfig {
  id: string;
  type: PopupType;
  title: string;
  content: string | string[];
  showOnce?: boolean;
  onDismiss?: () => void;
}

export function useEducationalPopup() {
  const [currentPopup, setCurrentPopup] = useState<PopupConfig | null>(null);
  const { markPopupShown, dismissPopup, isPopupDismissed, hasPopupBeenShown } = useEducationalStore();

  const showPopup = useCallback((config: PopupConfig) => {
    // Check if popup should be shown
    if (config.showOnce && (isPopupDismissed(config.id) || hasPopupBeenShown(config.id))) {
      return;
    }

    markPopupShown(config.id);
    setCurrentPopup(config);
  }, [isPopupDismissed, hasPopupBeenShown, markPopupShown]);

  const closePopup = useCallback(() => {
    setCurrentPopup(null);
  }, []);

  const handleDismiss = useCallback(() => {
    if (currentPopup) {
      dismissPopup(currentPopup.id);
      if (currentPopup.onDismiss) {
        currentPopup.onDismiss();
      }
      setCurrentPopup(null);
    }
  }, [currentPopup, dismissPopup]);

  const PopupComponent = currentPopup ? (
    <EducationalPopup
      type={currentPopup.type}
      title={currentPopup.title}
      content={currentPopup.content}
      onClose={closePopup}
      onDismiss={currentPopup.showOnce ? handleDismiss : undefined}
    />
  ) : null;

  return {
    showPopup,
    closePopup,
    PopupComponent,
  };
}

