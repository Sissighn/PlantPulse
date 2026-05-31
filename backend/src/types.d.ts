export type AccountType = "registered" | "guest";

export type PublicUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
};

export type StoredUser = {
  id: string;
  email: string | null;
  passwordHash: string | null;
  displayName: string | null;
  accountType: AccountType;
  createdAt: string;
  updatedAt: string;
};

export type Plant = {
  id: string;
  userId?: string | null;
  user_id?: string | null;
  name: string;
  type?: string | null;
  baseInterval?: number | null;
  lastWatered?: string | null;
  image?: string | null;
  imageUrl?: string | null;
};
