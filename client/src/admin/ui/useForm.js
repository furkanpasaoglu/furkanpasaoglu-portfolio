import { useCallback, useMemo, useState } from 'react';

/**
 * The panel's form engine. Replaces @mantine/form with the small part of it
 * the admin actually used: dot-path values, zod validation on submit, and
 * per-field errors.
 *
 * Values are controlled, which is what the edit pages already assumed.
 */

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

function setPath(obj, path, value) {
  const keys = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = clone;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    const child = cursor[k];
    cursor[k] = Array.isArray(child) ? [...child] : { ...(child ?? {}) };
    cursor = cursor[k];
  }
  cursor[keys[keys.length - 1]] = value;
  return clone;
}

export function useForm({ initial, schema }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  const set = useCallback((path, value) => {
    setValues((prev) => setPath(prev, path, value));
    setDirty(true);
    setErrors((prev) => (prev[path] === undefined ? prev : { ...prev, [path]: undefined }));
  }, []);

  const reset = useCallback((next) => {
    setValues(next);
    setErrors({});
    setDirty(false);
  }, []);

  /** Bind a text/number input. */
  const bind = useCallback((path, { number = false } = {}) => ({
    value: getPath(values, path) ?? '',
    onChange: (e) => {
      const raw = e.target.value;
      set(path, number ? (raw === '' ? 0 : Number(raw)) : raw);
    },
  }), [values, set]);

  /** Bind a checkbox / switch. */
  const bindCheck = useCallback((path) => ({
    checked: !!getPath(values, path),
    onChange: (e) => set(path, e.target.checked),
  }), [values, set]);

  const value = useCallback((path) => getPath(values, path), [values]);
  const error = useCallback((path) => errors[path], [errors]);

  /** Validate against the schema; returns the parsed values when clean. */
  const validate = useCallback(() => {
    if (!schema) return { ok: true, data: values };
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return { ok: true, data: result.data };
    }
    const next = {};
    (result.error?.issues ?? []).forEach((issue) => {
      const key = issue.path.join('.');
      if (next[key] === undefined) next[key] = issue.message;
    });
    setErrors(next);
    return { ok: false, data: values, errors: next };
  }, [schema, values]);

  return useMemo(() => ({
    values, setValues, set, reset, bind, bindCheck, value, error, errors, validate, dirty,
  }), [values, set, reset, bind, bindCheck, value, error, errors, validate, dirty]);
}
