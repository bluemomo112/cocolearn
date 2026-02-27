'use client';

import { useState, useEffect, useCallback } from 'react';

// Date 字段名列表，反序列化时自动恢复为 Date 对象
const DATE_FIELDS = new Set([
  'lastAccessedAt', 'createdAt', 'updatedAt', 'completedAt',
  'timestamp', 'generatedAt', 'submittedAt',
]);

function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && DATE_FIELDS.has(_key)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
}

// Set → Array 序列化
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Set) return [...value];
  return value;
}

export function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value, replacer));
  } catch (e) {
    console.warn('[storage] save failed:', key, e);
  }
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw, dateReviver) as T;
  } catch (e) {
    console.warn('[storage] load failed:', key, e);
    return fallback;
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('[storage] remove failed:', key, e);
  }
}

/** 清理某个 spaceId 下所有 workbench 相关的 localStorage keys */
export function clearSpaceStorage(spaceId: string): void {
  const prefix = `self-study:wb:${spaceId}:`;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn('[storage] clearSpaceStorage failed:', spaceId, e);
  }
}

/**
 * useState 的持久化替代品。
 * - SSR 安全：初始渲染使用 initialValue，hydrate 后从 localStorage 读取
 * - 每次 setState 自动写入 localStorage
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setStateRaw] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // hydrate: 客户端挂载后从 localStorage 读取
  useEffect(() => {
    const stored = loadFromStorage<T | undefined>(key, undefined);
    if (stored !== undefined) {
      setStateRaw(stored);
    }
    setHydrated(true);
  }, [key]);

  // 持久化：hydrate 完成后，state 变化时写入 localStorage
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(key, state);
  }, [key, state, hydrated]);

  const setState: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (action) => setStateRaw(action),
    [],
  );

  return [state, setState];
}
