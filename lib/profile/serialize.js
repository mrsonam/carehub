import { avatarDisplayUrl } from "./avatar-url.js";

export const profileSelect = {
  id: true,
  role: true,
  email: true,
  name: true,
  phone: true,
  title: true,
  bio: true,
  specialty: true,
  department: true,
  avatarUrl: true,
  dateOfBirth: true,
  gender: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  postalCode: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  profileCompletedAt: true,
  updatedAt: true,
};

/** @param {import("@prisma/client").User} user */
export function serializeProfile(user) {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    phone: user.phone,
    title: user.title,
    bio: user.bio,
    specialty: user.specialty,
    department: user.department,
    avatarUrl: avatarDisplayUrl(user.avatarUrl, user.updatedAt),
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    gender: user.gender,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    city: user.city,
    state: user.state,
    postalCode: user.postalCode,
    emergencyContactName: user.emergencyContactName,
    emergencyContactPhone: user.emergencyContactPhone,
    profileCompletedAt: user.profileCompletedAt?.toISOString() ?? null,
  };
}
