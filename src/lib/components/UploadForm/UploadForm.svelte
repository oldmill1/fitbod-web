<!-- src/lib/components/UploadForm/UploadForm.svelte - UploadForm.svelte -->
<script lang="ts">
	import styles from './UploadForm.module.scss';

	let isDragOver = false;
	let selectedFiles: File[] = [];
	let fileInput: HTMLInputElement;
	let uploading = false;
	let uploadResult: any = null;

	// Upload files to backend
	async function uploadFiles(files: File[]) {
		if (files.length === 0) return;

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

			if (uploadResult.files) {
				uploadResult.files.forEach((file: any, index: number) => {
					console.log(`=== FILE ${index + 1}: ${file.name} ===`);
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
				error: 'Upload failed: ' + error.message
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
		<!-- Display Analysis Results -->
		<div class={styles.analysisResults}>
			{#each uploadResult.files as file}
				{#if file.analysis && !file.analysis.error}
					<div class={styles.workoutCard}>
						<div class={styles.workoutHeader}>
							<h2 class={styles.workoutTitle}>Workout Analysis</h2>
							<div class={styles.workoutMeta}>
								{#if file.analysis.date}
									<span class={styles.workoutDate}>📅 {file.analysis.date}</span>
								{/if}
								{#if file.analysis.duration}
									<span class={styles.workoutDuration}>⏱️ {file.analysis.duration}</span>
								{/if}
							</div>
						</div>

						{#if file.analysis.exercises && file.analysis.exercises.length > 0}
							<div class={styles.exercisesList}>
								<h3 class={styles.exercisesTitle}>Exercises ({file.analysis.exercises.length})</h3>
								{#each file.analysis.exercises as exercise, idx}
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

						<div class={styles.fileName}>📄 {file.name}</div>
					</div>
				{:else}
					<!-- Error display for failed analysis -->
					<div class={styles.errorCard}>
						<div class={styles.errorIcon}>❌</div>
						<div class={styles.errorTitle}>Analysis Failed</div>
						<div class={styles.errorMessage}>
							{file.message || 'Could not analyze this workout image'}
						</div>
						<div class={styles.fileName}>📄 {file.name}</div>
					</div>
				{/if}
			{/each}

			<!-- Reset button -->
			<button class={styles.resetButton} on:click={resetUpload}>
				Upload Another Workout
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
						<div>Drop images here or click to select</div>
						<div class={styles.supportedFormats}>PNG, JPG, JPEG supported</div>
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