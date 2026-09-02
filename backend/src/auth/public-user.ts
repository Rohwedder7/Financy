export const PUBLIC_USER_FIELDS = { createdAt: true, email: true, id: true, name: true } as const;

export type PublicUser = {
  createdAt: Date;
  email: string;
  id: string;
  name: string;
};

export function toPublicUser(record: PublicUser): PublicUser {
  return {
    createdAt: record.createdAt,
    email: record.email,
    id: record.id,
    name: record.name,
  };
}
