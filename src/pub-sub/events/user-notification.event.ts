export type UserNotificationsEvent = {
  id: string;
  userId: string;
  title?: {
    en?: string;
    ru?: string;
  };
  link: string;
  text: string;
  date: number;
  type: string;
  root: string;
  unread: boolean;
};
