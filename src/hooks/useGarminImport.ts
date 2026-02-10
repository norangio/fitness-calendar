import { useState, useCallback } from 'react';
import { parseGarminCSV, type GarminParseResult } from '../lib/garminParser.ts';

export function useGarminImport() {
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<GarminParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setParsing(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      const parsed = parseGarminCSV(text);
      setResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file');
    } finally {
      setParsing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setParsing(false);
  }, []);

  return { parseFile, parsing, result, error, reset };
}
