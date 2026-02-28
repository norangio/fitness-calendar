import { exportBackupJSON } from './storage.ts';

const GIST_API = 'https://api.github.com/gists';
const GIST_FILENAME = 'fitness_data.json';

function getConfig() {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const gistId = import.meta.env.VITE_FITNESS_GIST_ID;
  return { token, gistId };
}

export function isGistSyncConfigured(): boolean {
  const { token, gistId } = getConfig();
  return Boolean(token && gistId);
}

export async function syncToGist(): Promise<{ success: boolean; error?: string }> {
  const { token, gistId } = getConfig();

  if (!token || !gistId) {
    return { success: false, error: 'Gist sync not configured. Set VITE_GITHUB_TOKEN and VITE_FITNESS_GIST_ID in .env' };
  }

  try {
    const data = await exportBackupJSON();

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
            content: JSON.stringify(data, null, 2),
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
