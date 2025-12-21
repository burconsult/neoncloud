import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Email } from '@/types/email';

interface EmailState {
  emails: Email[];
  currentEmailId: string | null;
  
  // Actions
  addEmail: (email: Email) => void;
  markAsRead: (emailId: string) => void;
  getUnreadCount: () => number;
  getEmailById: (emailId: string) => Email | undefined;
  getEmailsByMission: (missionId: string) => Email[];
  clearEmails: () => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set, get) => ({
      emails: [],
      currentEmailId: null,

      addEmail: (email: Email) => {
        set((state) => {
          // Check if email with this ID already exists (prevent duplicates)
          const existingEmail = state.emails.find(e => e.id === email.id);
          if (existingEmail) {
            // Email already exists, don't add duplicate
            return state;
          }
          // Add new email at the beginning (newest first)
          return {
            emails: [email, ...state.emails],
          };
        });
      },

      markAsRead: (emailId: string) => {
        set((state) => ({
          emails: state.emails.map((email) =>
            email.id === emailId ? { ...email, read: true } : email
          ),
        }));
      },

      getUnreadCount: () => {
        return get().emails.filter((email) => !email.read).length;
      },

      getEmailById: (emailId: string) => {
        return get().emails.find((email) => email.id === emailId);
      },

      getEmailsByMission: (missionId: string) => {
        return get().emails.filter((email) => email.missionId === missionId);
      },

      clearEmails: () => {
        set({ emails: [], currentEmailId: null });
      },
    }),
    {
      name: 'neoncloud-email',
      partialize: (state) => ({
        emails: state.emails,
        currentEmailId: state.currentEmailId,
      }),
    }
  )
);

