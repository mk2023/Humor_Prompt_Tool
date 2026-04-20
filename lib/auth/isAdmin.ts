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

const ADMIN_KEYS = [
  "is_superadmin",
  "isSuperAdmin",
  "is_matrix_admin",
  "isMatrixAdmin",
];

export function getAdminDebugInfo(profile: ProfileLike, user: UserLike) {
  const profileSuperadmin = profile?.is_superadmin === true;
  const profileMatrixAdmin = profile?.is_matrix_admin === true;
  const appMetadataAdmin = readBool(user?.app_metadata, ADMIN_KEYS);
  const userMetadataAdmin = readBool(user?.user_metadata, ADMIN_KEYS);

  return {
    profileFound: profile !== null,
    profileSuperadmin,
    profileMatrixAdmin,
    appMetadataAdmin,
    userMetadataAdmin,
    isAdmin:
      profileSuperadmin ||
      profileMatrixAdmin ||
      appMetadataAdmin ||
      userMetadataAdmin,
  };
}

export function isAdminUser(profile: ProfileLike, user: UserLike): boolean {
  return getAdminDebugInfo(profile, user).isAdmin;
}
