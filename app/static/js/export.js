// Export Manager - Handles pipeline export functionality
(function() {
    'use strict';

    console.log('Export Manager loaded');

    let currentModelId = null;

    /**
     * Initialize export system
     */
    function init(modelId = null) {
        console.log('Export Manager init called', modelId);
        currentModelId = modelId;
        setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        console.log('Setting up export event listeners');
        // Export button click
        const exportBtn = document.getElementById('export-btn');
        console.log('Export button found:', exportBtn);
        if (exportBtn) {
            exportBtn.addEventListener('click', openExportDialog);
        }

        // Export format buttons
        document.querySelectorAll('[data-export-format]').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.exportFormat;
                exportPipeline(format);
            });
        });

        // Close dialog button
        const closeBtn = document.querySelector('[data-close-dialog="export-formats-dialog"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeExportDialog);
        }

        // Click outside to close
        const dialog = document.getElementById('export-formats-dialog');
        if (dialog) {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeExportDialog();
                }
            });
        }
    }

    /**
     * Open export dialog
     */
    function openExportDialog() {
        console.log('Opening export dialog');
        const dialog = document.getElementById('export-formats-dialog');
        console.log('Dialog element:', dialog);
        if (dialog) {
            dialog.removeAttribute('hidden');
            // Reinitialize Lucide icons in the dialog
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } else {
            console.error('Export dialog not found');
        }
    }

    /**
     * Close export dialog
     */
    function closeExportDialog() {
        const dialog = document.getElementById('export-formats-dialog');
        if (dialog) {
            dialog.setAttribute('hidden', '');
        }
    }

    /**
     * Export pipeline in specified format
     */
    async function exportPipeline(format) {
        // Get current model ID from canvas
        if (typeof window.getCurrentModelId === 'function') {
            currentModelId = window.getCurrentModelId();
        }
        
        if (!currentModelId) {
            window.api.showToast('Please save the model first', 'error');
            return;
        }

        // Show loading state
        showExportLoading(format);

        try {
            let result;
            
            switch (format) {
                case 'python':
                    result = await window.api.export.exportPython(currentModelId);
                    downloadFile(result.script, result.filename, 'text/x-python');
                    // Also download requirements
                    downloadFile(result.requirements, 'requirements.txt', 'text/plain');
                    window.api.showToast('Python script exported successfully!', 'success');
                    break;

                case 'notebook':
                    result = await window.api.export.exportNotebook(currentModelId);
                    downloadFile(result.notebook, result.filename, 'application/json');
                    window.api.showToast('Jupyter notebook exported successfully!', 'success');
                    break;

                case 'docker':
                    result = await window.api.export.exportDocker(currentModelId);
                    // Create a zip file with all Docker artifacts
                    await downloadDockerArtifacts(result);
                    window.api.showToast('Docker files exported successfully!', 'success');
                    break;

                case 'requirements':
                    result = await window.api.export.exportRequirements(currentModelId);
                    downloadFile(result.requirements, result.filename, 'text/plain');
                    window.api.showToast('Requirements.txt exported successfully!', 'success');
                    break;

                default:
                    throw new Error('Unknown export format');
            }

            closeExportDialog();

        } catch (error) {
            console.error('Export failed:', error);
            window.api.showToast(`Export failed: ${error.message}`, 'error');
        } finally {
            hideExportLoading(format);
        }
    }

    /**
     * Download file to user's computer
     */
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Download Docker artifacts as multiple files
     */
    async function downloadDockerArtifacts(result) {
        // Download each file separately
        const files = {
            'Dockerfile': result.Dockerfile,
            'docker-compose.yml': result['docker-compose.yml'],
            '.dockerignore': result['.dockerignore'],
            'README.md': result['README.md'],
            [result.script_filename]: result.script,
            'requirements.txt': result.requirements
        };

        // Download with small delays to prevent browser blocking
        for (const [filename, content] of Object.entries(files)) {
            await new Promise(resolve => setTimeout(resolve, 100));
            downloadFile(content, filename, 'text/plain');
        }

        // Show instruction
        window.api.showToast(
            'Docker files downloaded. Check your downloads folder!',
            'success'
        );
    }

    /**
     * Show loading state for export button
     */
    function showExportLoading(format) {
        const btn = document.querySelector(`[data-export-format="${format}"]`);
        if (btn) {
            btn.disabled = true;
            btn.classList.add('loading');
            const originalText = btn.textContent;
            btn.dataset.originalText = originalText;
            btn.innerHTML = '<span class="spinner-small"></span> Exporting...';
        }
    }

    /**
     * Hide loading state for export button
     */
    function hideExportLoading(format) {
        const btn = document.querySelector(`[data-export-format="${format}"]`);
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('loading');
            btn.textContent = btn.dataset.originalText || 'Export';
        }
    }

    /**
     * Get current model ID
     */
    function getCurrentModelId() {
        return currentModelId;
    }

    /**
     * Set current model ID
     */
    function setCurrentModelId(modelId) {
        currentModelId = modelId;
    }

    // Export public API
    window.ExportManager = {
        init,
        openExportDialog,
        closeExportDialog,
        exportPipeline,
        getCurrentModelId,
        setCurrentModelId
    };

})();
