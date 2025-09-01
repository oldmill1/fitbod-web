// src/routes/api/upload/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];

		if (!files || files.length === 0) {
			return json({ success: false, error: 'No files provided' }, { status: 400 });
		}

		// Validate that all files are images
		const imageFiles = files.filter((file) => {
			return file.type.startsWith('image/') && file.size > 0;
		});

		if (imageFiles.length === 0) {
			return json({ success: false, error: 'No valid image files provided' }, { status: 400 });
		}

		// For now, just return the file info
		// Later we'll add actual image processing logic here
		const processedFiles = imageFiles.map((file) => {
			return {
				name: file.name,
				size: file.size,
				type: file.type,
				receivedAt: new Date().toISOString(),
				status: 'received',
				message: `Successfully received ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
			};
		});

		console.log(
			'Processed files:',
			processedFiles.map((f) => f.name)
		);

		return json({
			success: true,
			message: `Successfully received ${processedFiles.length} image(s)`,
			files: processedFiles
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ success: false, error: 'Failed to process upload' }, { status: 500 });
	}
};
