<!-- src/lib/components/UploadForm/UploadForm.svelte - UploadForm.svelte -->
<script lang="ts">
	import styles from './UploadForm.module.scss';

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

	let isDragOver = false;
	let selectedFiles: File[] = [];
	let fileInput: HTMLInputElement;
	let uploading = false;
	let uploadResult: UploadResult | null = null;

	// Upload files to backend
	async function uploadFiles(files: File[]) {
		if (files.length === 0) return;

		if (files.length !== 2) {
			uploadResult = {
				success: false,
				error: 'Please upload exactly 2 images: one workout summary and one muscle group summary'
			};
			return;
		}

		uploading = true;
		uploadResult = null;

		try {
			const formData = new FormData();
			files.forEach(file => {
				formData.append('files', file);
			});

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			uploadResult = await response.json();

			// Keep console logging for debugging
			console.log('=== UPLOAD RESPONSE ===');
			console.log('Full response:', uploadResult);

			if (uploadResult && uploadResult.files) {
				uploadResult.files.forEach((file: any, index: number) => {
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

		} catch (error) {
			console.error('Upload failed:', error);
			uploadResult = {
				success: false,
				error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
			};
		} finally {
			uploading = false;
		}
	}

	// Handle file selection via click
	function handleClick() {
		fileInput?.click();
	}

	// Handle file input change
	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			selectedFiles = Array.from(target.files).filter(file =>
				file.type.startsWith('image/')
			);
			console.log('Files selected:', selectedFiles);
			if (selectedFiles.length > 0) {
				uploadFiles(selectedFiles);
			}
		}
	}

	// Handle drag over
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	// Handle drag leave
	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	// Handle drop
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files) {
			selectedFiles = Array.from(files).filter(file =>
				file.type.startsWith('image/')
			);
			console.log('Files dropped:', selectedFiles);
			if (selectedFiles.length > 0) {
				uploadFiles(selectedFiles);
			}
		}
	}

	// Handle keyboard events for accessibility
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}

	// Reset upload to start over
	function resetUpload() {
		uploadResult = null;
		selectedFiles = [];
	}
</script>

<svelte:head>
	<title>Upload Workout Summary - AI Analysis</title>
	<meta name="description" content="Upload your workout summary screenshots for AI analysis" />
</svelte:head>

<div class={styles.uploadContainer}>
	<h1 class={styles.header}>Upload Your<br /> Workout Summary</h1>

	{#if uploadResult && uploadResult.success && uploadResult.files}
		{@const workoutData = uploadResult.files.find((f: ProcessedFile) => f.imageType === 'workout_summary')}
		{@const muscleData = uploadResult.files.find((f: ProcessedFile) => f.imageType === 'muscle_groups')}

		<!-- Display Analysis Results -->
		<div class={styles.analysisResults}>
			<div class={styles.workoutCard}>
				<!-- Workout Header with basic info -->
				<div class={styles.workoutHeader}>
					<h2 class={styles.workoutTitle}>Complete Workout Analysis</h2>
					<div class={styles.workoutMeta}>
						{#if workoutData?.analysis?.date}
							<span class={styles.workoutDate}>📅 {workoutData.analysis.date}</span>
						{/if}
						{#if workoutData?.analysis?.duration}
							<span class={styles.workoutDuration}>⏱️ {workoutData.analysis.duration}</span>
						{/if}
					</div>
				</div>

				<!-- Muscle Groups Summary -->
				{#if muscleData?.analysis && !muscleData.analysis.error}
					<div class={styles.muscleGroupsSection}>
						<h3 class={styles.sectionTitle}>Muscle Groups Targeted</h3>
						<div class={styles.muscleGroupsCard}>
							{#if muscleData.analysis.muscleGroups}
								<div class={styles.muscleGroups}>
									<span class={styles.muscleGroupsLabel}>Primary Focus:</span>
									<span class={styles.muscleGroupsList}>{muscleData.analysis.muscleGroups}</span>
								</div>
							{/if}

							<div class={styles.workoutStats}>
								{#if muscleData.analysis.calories}
									<div class={styles.workoutStat}>
										<span class={styles.statLabel}>Calories</span>
										<span
											class={styles.statValue}>{muscleData.analysis.calories} {muscleData.analysis.caloriesUnit || ''}</span>
									</div>
								{/if}
								{#if muscleData.analysis.volume}
									<div class={styles.workoutStat}>
										<span class={styles.statLabel}>Total Volume</span>
										<span
											class={styles.statValue}>{muscleData.analysis.volume} {muscleData.analysis.volumeUnit || ''}</span>
									</div>
								{/if}
							</div>

							{#if muscleData.analysis.exercises}
								<div class={styles.muscleGroupExercises}>
									<span class={styles.exercisesLabel}>Main Exercises:</span>
									<span class={styles.exercisesList}>{muscleData.analysis.exercises}</span>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Detailed Exercise Breakdown -->
				{#if workoutData?.analysis?.exercises && workoutData.analysis.exercises.length > 0}
					<div class={styles.exercisesSection}>
						<h3 class={styles.sectionTitle}>Exercise Details ({workoutData.analysis.exercises.length})</h3>
						{#each workoutData.analysis.exercises as exercise, idx}
							<div class={styles.exerciseCard}>
								<div class={styles.exerciseName}>{exercise.name}</div>
								<div class={styles.exerciseStats}>
									{#if exercise.highestWeight && exercise.highestWeight !== 'not visible'}
										<div class={styles.exerciseStat}>
											<span class={styles.statLabel}>Highest Weight</span>
											<span class={styles.statValue}>{exercise.highestWeight}</span>
										</div>
									{/if}
									{#if exercise.volume && exercise.volume !== 'not visible'}
										<div class={styles.exerciseStat}>
											<span class={styles.statLabel}>Volume</span>
											<span class={styles.statValue}>{exercise.volume}</span>
										</div>
									{/if}
									{#if exercise.estimatedStrength && exercise.estimatedStrength !== 'not visible'}
										<div class={styles.exerciseStat}>
											<span class={styles.statLabel}>Est. Strength</span>
											<span class={styles.statValue}>{exercise.estimatedStrength}</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Source Files Info -->
				<div class={styles.sourceFiles}>
					<div class={styles.sourceFile}>📄 {workoutData?.name || 'Workout Summary'}</div>
					<div class={styles.sourceFile}>📄 {muscleData?.name || 'Muscle Groups'}</div>
				</div>
			</div>

			<!-- Reset button -->
			<button class={styles.resetButton} on:click={resetUpload}>
				Analyze Another Workout
			</button>
		</div>
	{:else}
		<!-- Upload Form -->
		<div
			class="{styles.uploadForm} {isDragOver ? styles.dragOver : ''}"
			on:click={handleClick}
			on:keydown={handleKeydown}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:drop={handleDrop}
			role="button"
			tabindex="0"
		>
			<div class={styles.uploadPlaceholder}>
				{#if uploading}
					<div class={styles.placeholderText}>
						<div class={styles.uploadIcon}>⏳</div>
						<div>Analyzing workout...</div>
						<div style="font-size: 0.8rem; opacity: 0.7;">This may take a few seconds</div>
					</div>
				{:else if uploadResult && !uploadResult.success}
					<div class={styles.errorText}>
						<div class={styles.uploadIcon}>❌</div>
						<div>{uploadResult.error}</div>
						<button class={styles.retryButton} on:click={resetUpload}>Try Again</button>
					</div>
				{:else if selectedFiles.length > 0}
					<div class={styles.fileList}>
						{#each selectedFiles as file}
							<div class={styles.fileName}>{file.name}</div>
						{/each}
					</div>
				{:else}
					<div class={styles.placeholderText}>
						<div class={styles.uploadIcon}>📸</div>
						<div>Drop <strong>2 images</strong> here or click to select</div>
						<div class={styles.supportedFormats}>
							1. Workout Summary (with exercise details)<br />
							2. Muscle Group Summary (with muscle illustrations)
						</div>
						<div class={styles.uploadHint}>Both images are required for complete analysis</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Hidden file input -->
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		on:change={handleFileChange}
		style="display: none;"
	/>

	<p class={styles.footer}>Not affiliated with Fitbod.me</p>
</div>