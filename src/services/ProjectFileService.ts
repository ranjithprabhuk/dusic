import type { ProjectFile } from '../types/project';
import type { Track } from '../types/composition';

class ProjectFileService {
  exportProject(composition: { name: string; bpm: number; tracks: Track[] }): string {
    const project: ProjectFile = {
      version: '1.0.0',
      appName: 'dusic',
      composition: {
        name: composition.name,
        bpm: composition.bpm,
        tracks: JSON.parse(JSON.stringify(composition.tracks)),
      },
      createdAt: new Date().toISOString(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(project, null, 2);
  }

  importProject(jsonString: string): ProjectFile {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON file.');
    }

    const file = parsed as Record<string, unknown>;
    if (file.appName !== 'dusic') {
      throw new Error('Not a valid Dusic project file.');
    }
    if (!file.composition || typeof file.composition !== 'object') {
      throw new Error('Project file is missing composition data.');
    }

    return parsed as ProjectFile;
  }

  downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }
}

export const projectFileService = new ProjectFileService();
