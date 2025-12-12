// Version Management - Pipeline Versioning System
(function () {
    'use strict';

    let currentModelId = null;
    let versions = [];

    // Initialize version management
    window.versionsInit = function () {
        setupEventListeners();
    };

    function setupEventListeners() {
        // Versions button
        const versionsBtn = document.getElementById('versions-btn');
        if (versionsBtn) {
            versionsBtn.addEventListener('click', openVersionsDialog);
        }

        // Create version button
        const createVersionBtn = document.getElementById('create-version-btn');
        if (createVersionBtn) {
            createVersionBtn.addEventListener('click', createVersion);
        }
    }

    async function openVersionsDialog() {
        // Check if a model is loaded
        if (!window.getCurrentModelId || !window.getCurrentModelId()) {
            window.showToast('Please save or load a model first', 'info');
            return;
        }

        currentModelId = window.getCurrentModelId();

        // Open dialog
        const dialog = document.getElementById('versions-dialog');
        if (dialog) {
            dialog.hidden = false;
            await loadVersions();
        }
    }

    async function loadVersions() {
        const container = document.getElementById('versions-list');
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <i data-lucide="loader" class="spinner"></i>
                <span>Loading versions...</span>
            </div>
        `;
        lucide.createIcons();

        try {
            const response = await window.api.versions.list(currentModelId);
            versions = response;

            if (versions.length === 0) {
                container.innerHTML = `
                    <div class="empty-state-small">
                        <i data-lucide="git-branch"></i>
                        <span>No versions yet. Create your first version!</span>
                    </div>
                `;
            } else {
                renderVersions(versions);
            }

            lucide.createIcons();
        } catch (error) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <i data-lucide="alert-circle"></i>
                    <span>Failed to load versions: ${error.message}</span>
                </div>
            `;
            lucide.createIcons();
        }
    }

    function renderVersions(versions) {
        const container = document.getElementById('versions-list');

        container.innerHTML = `
            <div class="versions-timeline">
                ${versions.map(version => `
                    <div class="version-item ${version.is_active ? 'version-active' : ''}" data-version-id="${version.id}">
                        <div class="version-header">
                            <div class="version-info">
                                <div class="version-number">
                                    v${version.version_number}
                                    ${version.is_active ? '<span class="badge badge-success">Active</span>' : ''}
                                    ${version.version_tag ? `<span class="badge badge-info">${version.version_tag}</span>` : ''}
                                </div>
                                <div class="version-name">${version.name || 'Untitled Version'}</div>
                                ${version.description ? `<div class="version-description">${version.description}</div>` : ''}
                                <div class="version-meta">
                                    Created: ${formatDate(version.created_at)} • 
                                    ${version.nodes.length} components • 
                                    ${version.edges.length} connections
                                </div>
                            </div>
                            <div class="version-actions">
                                <button class="btn btn-ghost btn-xs" onclick="window.loadVersion(${version.id})" title="Load this version">
                                    <i data-lucide="download"></i>
                                </button>
                                ${!version.is_active ? `
                                    <button class="btn btn-ghost btn-xs" onclick="window.activateVersion(${version.id})" title="Set as active">
                                        <i data-lucide="check-circle"></i>
                                    </button>
                                ` : ''}
                                ${!version.is_active ? `
                                    <button class="btn btn-ghost btn-xs text-error" onclick="window.deleteVersion(${version.id})" title="Delete version">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        lucide.createIcons();
    }

    async function createVersion() {
        if (!currentModelId) {
            window.showToast('No model loaded', 'error');
            return;
        }

        // Get current canvas state
        const state = window.getCanvasState();
        if (!state || !state.nodes || state.nodes.length === 0) {
            window.showToast('Cannot create version of empty pipeline', 'error');
            return;
        }

        // Prompt for version details
        const name = prompt('Version name:', `Version ${versions.length + 1}`);
        if (!name) return;

        const description = prompt('Version description (optional):', '');

        try {
            const response = await window.api.versions.create(currentModelId, {
                name,
                description,
                nodes: state.nodes,
                edges: state.edges,
                generate_code: true,
                metadata: {
                    created_from: 'builder',
                    timestamp: new Date().toISOString()
                }
            });

            window.showToast('Version created successfully', 'success');
            await loadVersions();
        } catch (error) {
            window.showToast('Failed to create version: ' + error.message, 'error');
        }
    }

    // Load a specific version
    window.loadVersion = async function (versionId) {
        try {
            const response = await window.api.versions.get(versionId);

            // Load into canvas
            if (window.loadCanvasState) {
                window.loadCanvasState({
                    nodes: response.nodes,
                    edges: response.edges
                });
                window.showToast(`Loaded ${response.name}`, 'success');

                // Close dialog
                const dialog = document.getElementById('versions-dialog');
                if (dialog) dialog.hidden = true;
            }
        } catch (error) {
            window.showToast('Failed to load version: ' + error.message, 'error');
        }
    };

    // Activate a version
    window.activateVersion = async function (versionId) {
        if (!confirm('Set this as the active version?')) return;

        try {
            await window.api.versions.activate(versionId);
            window.showToast('Version activated', 'success');
            await loadVersions();
        } catch (error) {
            window.showToast('Failed to activate version: ' + error.message, 'error');
        }
    };

    // Delete a version
    window.deleteVersion = async function (versionId) {
        if (!confirm('Delete this version? This action cannot be undone.')) return;

        try {
            await window.api.versions.delete(versionId);
            window.showToast('Version deleted', 'success');
            await loadVersions();
        } catch (error) {
            window.showToast('Failed to delete version: ' + error.message, 'error');
        }
    };

    // Helper function to format dates
    function formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', window.versionsInit);
})();
