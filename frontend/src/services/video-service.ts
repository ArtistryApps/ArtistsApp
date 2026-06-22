import apiClient from '@/utils/api-client';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the data URL prefix (e.g. "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export interface JoinAudioVideoResult {
  base64_video: string;
}

export const videoService = {
  async joinAudioVideo(
    videoFile: File,
    audioFile: File,
    removeAudioFromMp4s?: boolean,
  ): Promise<Blob> {
    const [video_base64, audio_base64] = await Promise.all([
      fileToBase64(videoFile),
      fileToBase64(audioFile),
    ]);

    const response = await apiClient.post<JoinAudioVideoResult>(
      '/api/v1/video/video/join_audio_video_overlap',
      { video_base64, audio_base64, remove_audio_from_mp4s: removeAudioFromMp4s ?? true },
      { timeout: 300_000 }, // 5 min — video processing can be slow
    );

    const binary = atob(response.data.base64_video);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'video/mp4' });
  },
};
