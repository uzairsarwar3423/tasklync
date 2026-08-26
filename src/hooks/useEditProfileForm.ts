import { useState, useMemo, useEffect, useCallback } from 'react';
import { UserProfile, EditProfileFormState } from '../types/user.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEditProfileForm(initialProfile?: UserProfile | null) {
  const [original, setOriginal] = useState<EditProfileFormState>({
    name: initialProfile?.name || '',
    email: initialProfile?.email || '',
  });

  const [name, setName] = useState<string>(initialProfile?.name || '');
  const [email, setEmail] = useState<string>(initialProfile?.email || '');

  // Initialize or re-sync when profile loads
  useEffect(() => {
    if (initialProfile) {
      const snap: EditProfileFormState = {
        name: initialProfile.name || '',
        email: initialProfile.email || '',
      };
      setOriginal(snap);
      setName(snap.name);
      setEmail(snap.email || '');
    }
  }, [initialProfile?.id, initialProfile?.name, initialProfile?.email]);

  /**
   * True Field-by-Field Dirty Check (Hard Problem #2)
   * Returns true only when current value differs from the original baseline.
   * If a user types and deletes back to original, isDirty returns false.
   */
  const isDirty = useMemo(() => {
    const isNameChanged = name.trim() !== original.name.trim();
    const isEmailChanged = (email.trim() || '') !== (original.email?.trim() || '');
    return isNameChanged || isEmailChanged;
  }, [name, email, original.name, original.email]);

  /**
   * Field Validation
   * - Name: Min 2 characters
   * - Email: Valid format if non-empty
   */
  const isValid = useMemo(() => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return false;

    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 0 && !EMAIL_REGEX.test(trimmedEmail)) {
      return false;
    }

    return true;
  }, [name, email]);

  const canSave = isDirty && isValid;

  const reset = useCallback(() => {
    setName(original.name);
    setEmail(original.email || '');
  }, [original]);

  return {
    name,
    setName,
    email,
    setEmail,
    isDirty,
    isValid,
    canSave,
    reset,
  };
}
