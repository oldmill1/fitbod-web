// src/lib/components/UploadForm/useFileUpload.ts
import { writable } from 'svelte/store';

// Type definitions
interface ProcessedFile {
	name: string;
	size: number;
	type: string;
	imageType: 'workout_summary' | 'muscle_groups';
	receivedAt: string;
	status: string;
	message: string;
	analysis: any;
	rawResponse: string;
}

interface UploadResult {
	success: boolean;
	message?: string;
	error?: string;
	files?: ProcessedFile[];
}

interface UploadState {
	uploading: boolean;
	selectedFiles: File[];
	uploadResult: UploadResult | null;
}

export function useFileUpload() {
	// Internal state
	const { subscribe, set, update } = writable<UploadState>({
		uploading: false,
		selectedFiles: [],
		uploadResult: null
	});

	// Upload files to backend
	async function uploadFiles(files: File[]) {
		if (files.length === 0) return;

		if (files.length !== 2) {
			update((state) => ({
				...state,
				uploadResult: {
					success: false,
					error: 'Please upload exactly 2 images: one workout summary and one muscle group summary'
				}
			}));
			return;
		}

		// Set uploading state
		update((state) => ({
			...state,
			uploading: true,
			uploadResult: null,
			selectedFiles: files
		}));

		try {
			const formData = new FormData();
			files.forEach((file) => {
				formData.append('files', file);
			});

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			// Debug logging
			console.log('=== UPLOAD RESPONSE ===');
			console.log('Full response:', result);

			if (result && result.files) {
				result.files.forEach((file: any, index: number) => {
					console.log(`=== FILE ${index + 1}: ${file.name} (${file.imageType}) ===`);
					console.log('Analysis status:', file.status);
					console.log('Message:', file.message);

					if (file.analysis) {
						console.log('=== AI ANALYSIS DATA ===');
						console.log('Parsed analysis:', file.analysis);
					}
					console.log('========================');
				});
			}

			// Update with results
			update((state) => ({
				...state,
				uploading: false,
				uploadResult: result
			}));
		} catch (error) {
			console.error('Upload failed:', error);
			update((state) => ({
				...state,
				uploading: false,
				uploadResult: {
					success: false,
					error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
				}
			}));
		}
	}

	// Handle file selection (from input or drop)
	function selectFiles(files: FileList | File[]) {
		const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
		console.log('Files selected:', fileArray);

		if (fileArray.length > 0) {
			uploadFiles(fileArray);
		}
	}

	// Reset upload to start over
	function reset() {
		set({
			uploading: false,
			selectedFiles: [],
			uploadResult: null
		});
	}

	return {
		subscribe,
		selectFiles,
		reset
	};
}
