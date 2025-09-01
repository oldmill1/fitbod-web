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
			console.log('Upload response:', uploadResult);

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
</script>

<svelte:head>
	<title>Upload Workout Summary - AI Analysis</title>
	<meta name="description" content="Upload your workout summary screenshots for AI analysis" />
</svelte:head>

<div class={styles.uploadContainer}>
	<h1 class={styles.header}>Upload Your<br /> Workout Summary</h1>

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
					<div>Uploading files...</div>
				</div>
			{:else if uploadResult}
				<div class={styles.resultText}>
					{#if uploadResult.success}
						<div class={styles.successText}>
							<div class={styles.uploadIcon}>✅</div>
							<div>{uploadResult.message}</div>
							{#if uploadResult.files}
								<div class={styles.fileDetails}>
									{#each uploadResult.files as file}
										<div class={styles.fileDetail}>{file.message}</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<div class={styles.errorText}>
							<div class={styles.uploadIcon}>❌</div>
							<div>{uploadResult.error}</div>
						</div>
					{/if}
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