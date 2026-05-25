/**
 * Custom hook for form handling with react-hook-form
 * Follows the pattern: handleSubmit, setValue, trigger, getValues
 */

import { useCallback } from 'react';
import { UseFormSetValue, UseFormTrigger, UseFormGetValues, FieldValues } from 'react-hook-form';

export interface UseFormHelpersProps<T extends FieldValues> {
  setValue: UseFormSetValue<T>;
  trigger: UseFormTrigger<T>;
  getValues: UseFormGetValues<T>;
}

/**
 * Hook to handle form field updates with automatic validation
 * Usage:
 * const { updateFieldValue } = useFormHelpers({ setValue, trigger, getValues });
 * updateFieldValue('fieldName', newValue);
 */
export const useFormHelpers = <T extends FieldValues>({
  setValue,
  trigger,
  getValues,
}: UseFormHelpersProps<T>) => {
  const updateFieldValue = useCallback(
    async (fieldName: keyof T, value: any) => {
      setValue(fieldName, value, { shouldDirty: true });
      await trigger(fieldName);
    },
    [setValue, trigger]
  );

  const getFieldValue = useCallback(
    (fieldName: keyof T) => {
      return getValues(fieldName);
    },
    [getValues]
  );

  return { updateFieldValue, getFieldValue, getValues };
};
