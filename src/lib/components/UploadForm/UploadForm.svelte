<!-- src/lib/components/UploadForm/UploadForm.svelte - Refactored with Composable -->
<script lang="ts">
	import styles from './UploadForm.module.scss';
	import WorkoutAnalysisResults from './WorkoutAnalysisResults.svelte';
	import { useFileUpload } from './useFileUpload';

	// Use the composable for all upload logic
	const uploadState = useFileUpload();
	const { selectFiles, reset } = uploadState;

	// UI state
	let isDragOver = false;
	let fileInput: HTMLInputElement;

	// Handle file selection via click
	function handleClick() {
		fileInput?.click();
	}

	// Handle file input change
	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			selectFiles(target.files);
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
			selectFiles(files);
		}
	}

	// Handle keyboard events for accessibility
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	}
</script>

<svelte:head>
	<title>Upload Workout Summary - AI Analysis</title>
	<meta name="description" content="Upload your workout summary screenshots for AI analysis" />
</svelte:head>

<div class={styles.uploadContainer}>
	<h1 class={styles.header}>Upload Your<br /> Workout Summary</h1>

	{#if $uploadState.uploadResult}
		<!-- Show results component when we have results -->
		<WorkoutAnalysisResults uploadResult={$uploadState.uploadResult} onReset={reset} />
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
				{#if $uploadState.uploading}
					<div class={styles.placeholderText}>
						<div class={styles.uploadIcon}>⏳</div>
						<div>Analyzing workout...</div>
						<div style="font-size: 0.8rem; opacity: 0.7;">This may take a few seconds</div>
					</div>
				{:else if $uploadState.selectedFiles.length > 0}
					<div class={styles.fileList}>
						{#each $uploadState.selectedFiles as file}
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