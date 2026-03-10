import { api } from './api.ts';

const GIST_API = 'https://api.github.com/gists';
const GIST_FILENAME = 'fitness_data.json';

type GistFileInfo = {
  content?: string;
  truncated?: boolean;
  raw_url?: string;
};

type GistResponse = {
  files?: Record<string, GistFileInfo>;
};

type GistFitnessData = Record<string, unknown> & {
  activities?: unknown[];
  bodyLogs?: unknown[];
};

function getConfig() {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const gistId = import.meta.env.VITE_FITNESS_GIST_ID;
  return { token, gistId };
}

export function isGistSyncConfigured(): boolean {
  const { token, gistId } = getConfig();
  return Boolean(token && gistId);
}

function sortActivities(activities: Array<{ id: string; date: string; startTime?: string }>) {
  return [...activities].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    const aStart = a.startTime ?? '';
    const bStart = b.startTime ?? '';
    if (aStart !== bStart) return bStart.localeCompare(aStart);
    return a.id.localeCompare(b.id);
  });
}

function sortBodyLogs(bodyLogs: Array<{ date: string; createdAt: string }>) {
  return [...bodyLogs].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

async function fetchExistingGistData(token: string, gistId: string): Promise<GistFitnessData> {
  const gistResp = await fetch(`${GIST_API}/${gistId}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!gistResp.ok) {
    const body = await gistResp.text();
    throw new Error(`Failed to read gist (${gistResp.status}): ${body}`);
  }

  const gistData = (await gistResp.json()) as GistResponse;
  const fileInfo = gistData.files?.[GIST_FILENAME];
  if (!fileInfo) return {};

  let fileContent = fileInfo.content ?? '{}';
  if (fileInfo.truncated && fileInfo.raw_url) {
    const rawResp = await fetch(fileInfo.raw_url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (!rawResp.ok) {
      const body = await rawResp.text();
      throw new Error(`Failed to read raw gist file (${rawResp.status}): ${body}`);
    }
    fileContent = await rawResp.text();
  }

  try {
    const parsed = JSON.parse(fileContent);
    return parsed && typeof parsed === 'object' ? (parsed as GistFitnessData) : {};
  } catch {
    return {};
  }
}

export async function syncToGist(): Promise<{ success: boolean; error?: string }> {
  const { token, gistId } = getConfig();

  if (!token || !gistId) {
    return { success: false, error: 'Gist sync not configured. Set VITE_GITHUB_TOKEN and VITE_FITNESS_GIST_ID in .env' };
  }

  try {
    const [data, existing] = await Promise.all([
      api.export(),
      fetchExistingGistData(token, gistId),
    ]);

    // Preserve non-export keys (e.g. Garmin-synced healthMetrics) while
    // replacing activities/bodyLogs from the source-of-truth backend export.
    const mergedData: GistFitnessData = {
      ...existing,
      ...data,
      activities: sortActivities(data.activities),
      bodyLogs: sortBodyLogs(data.bodyLogs),
    };

    const resp = await fetch(`${GIST_API}/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(mergedData, null, 2),
          },
        },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      return { success: false, error: `GitHub API error (${resp.status}): ${body}` };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
