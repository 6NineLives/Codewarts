import { File, Paths } from 'expo-file-system';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Contribution, ContributionCategory } from '@/contracts/contribution';

const contributionsFile = new File(Paths.document, 'user-contributions.json');

type AddContributionInput = {
  title: string;
  description: string;
  videoUri: string;
  category?: ContributionCategory;
  contributorName?: string;
};

type ContributionsContextValue = {
  userContributions: Contribution[];
  addContribution: (input: AddContributionInput) => Promise<Contribution>;
  isLoading: boolean;
};

const ContributionsContext = createContext<ContributionsContextValue | null>(null);

function makeId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toContribution(input: AddContributionInput): Contribution {
  const title = input.title.trim();
  const description = input.description.trim();
  return {
    id: makeId(),
    signKey: title.toUpperCase().replace(/\s+/g, '_'),
    signLabelTagalog: title,
    contributorName: input.contributorName?.trim() || 'You',
    category: input.category ?? 'phrases',
    videoUrl: input.videoUri,
    description,
    fslDefinition: description || `FSL Sign: "${title}"`,
    isUserRecording: true,
  };
}

async function readStoredContributions(): Promise<Contribution[]> {
  try {
    if (!contributionsFile.exists) return [];
    const raw = await contributionsFile.text();
    const parsed = JSON.parse(raw) as Contribution[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredContributions(contributions: Contribution[]): void {
  if (!contributionsFile.exists) {
    contributionsFile.create({ overwrite: true });
  }
  contributionsFile.write(JSON.stringify(contributions));
}

export function ContributionsProvider({ children }: { children: ReactNode }) {
  const [userContributions, setUserContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await readStoredContributions();
      if (!cancelled) {
        setUserContributions(stored);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addContribution = useCallback(async (input: AddContributionInput) => {
    const contribution = toContribution(input);
    setUserContributions((current) => {
      const next = [contribution, ...current];
      writeStoredContributions(next);
      return next;
    });
    return contribution;
  }, []);

  const value = useMemo(
    () => ({ userContributions, addContribution, isLoading }),
    [addContribution, isLoading, userContributions],
  );

  return <ContributionsContext.Provider value={value}>{children}</ContributionsContext.Provider>;
}

export function useContributions(): ContributionsContextValue {
  const context = useContext(ContributionsContext);
  if (!context) {
    throw new Error('useContributions must be used within ContributionsProvider');
  }
  return context;
}
