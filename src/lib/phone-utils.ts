"use client";

export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

export const formatPhoneNumber = (phone: string): string => {
  const digits = sanitizePhoneNumber(phone);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};
