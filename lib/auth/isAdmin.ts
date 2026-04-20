type ProfileLike = {
  is_superadmin?: boolean | null;
  is_matrix_admin?: boolean | null;
} | null;

type UserLike = {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
} | null;

function readBool(meta: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!meta) return false;
  return keys.some((k) => meta[k] === true);
}

export function isAdminUser(profile: ProfileLike, user: UserLike): boolean {
  if (profile?.is_superadmin || profile?.is_matrix_admin) return true;

  // Fallback for environments where profile row is missing or RLS blocks it.
  const keys = [
    "is_superadmin",
    "isSuperAdmin",
    "is_matrix_admin",
    "isMatrixAdmin",
  ];

  return (
    readBool(user?.app_metadata, keys) ||
    readBool(user?.user_metadata, keys)
  );
}
