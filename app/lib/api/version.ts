export interface VersionData {
  backendVersion: string;
  frontendVersion: string;
  gitCommitHash?: string;
  buildTimestamp?: string;
}

export async function fetchVersionData(): Promise<VersionData> {
  const response = await fetch('http://localhost:8080/api/version');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch version data: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getFrontendVersion(): Promise<string> {
  // В будущем можно читать из package.json динамически
  return '0.1.0';
}
