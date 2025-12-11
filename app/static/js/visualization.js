/**
 * visualization.js
 * Renders charts and results for the DominoML Simulator.
 */

class Visualizer {
    constructor() {
        this.container = document.getElementById('simulation-results-container');
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('simulation-node-complete', (e) => {
            const { nodeId, result } = e.detail;
            console.log(`Node ${nodeId} complete:`, result);
            // Flash the node in the canvas or show toast?
            if (window.showToast) {
                window.showToast(`Node complete: ${nodeId}`, 'success');
            }
        });
    }

    /**
     * Render the result of a specific node in the modal
     */
    renderResult(nodeData) {
        if (!nodeData || !nodeData.data) return;

        const contentDiv = document.getElementById('simulation-modal-content');
        contentDiv.innerHTML = ''; // Clear previous

        const type = nodeData.data.preview;
        const data = nodeData.data;

        // Header
        const header = document.createElement('h3');
        header.className = 'text-xl font-bold mb-4';
        header.innerText = `Result: ${nodeData.nodeName}`;
        contentDiv.appendChild(header);

        // Render based on type
        if (type === 'table') {
            this.renderTable(data, contentDiv);
        } else if (type === 'classification_report') {
            this.renderClassificationReport(data, contentDiv);
        } else if (type === 'regression_report') {
            this.renderRegressionMetrics(data, contentDiv);
        } else if (type === 'split_info') {
            this.renderSplitInfo(data, contentDiv);
        } else if (type === 'model_card') {
            this.renderModelCard(data, contentDiv);
        }
    }

    renderTable(data, container) {
        // Simple HTML Table
        const table = document.createElement('table');
        table.className = 'w-full text-sm text-left';

        // Headers
        const thead = document.createElement('thead');
        thead.className = 'text-xs uppercase bg-secondary';
        const headRow = document.createElement('tr');
        data.columns.forEach(col => {
            const th = document.createElement('th');
            th.className = 'px-4 py-2';
            th.innerText = col;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        // Body (First 10 rows)
        const tbody = document.createElement('tbody');
        data.data.slice(0, 10).forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-border';
            row.forEach(cell => {
                const td = document.createElement('td');
                td.className = 'px-4 py-2';
                td.innerText = typeof cell === 'number' ? cell.toFixed(2) : cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.appendChild(table);

        // Note
        const note = document.createElement('p');
        note.className = 'text-xs text-muted mt-2';
        note.innerText = `Showing first 10 of ${data.shape[0]} rows. ${data.note || ''}`;
        container.appendChild(note);
    }

    renderClassificationReport(data, container) {
        // Metric Cards
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-4 mb-6';

        const metrics = [
            { label: 'Accuracy', value: (data.accuracy * 100).toFixed(1) + '%' },
            { label: 'Classes', value: data.classes.length }
        ];

        metrics.forEach(m => {
            const card = document.createElement('div');
            card.className = 'card p-4 text-center';
            card.innerHTML = `<div class="text-2xl font-bold">${m.value}</div><div class="text-xs text-muted uppercase">${m.label}</div>`;
            grid.appendChild(card);
        });
        container.appendChild(grid);

        // Confusion Matrix Plot (using Plotly)
        const plotDiv = document.createElement('div');
        plotDiv.id = 'confusion-matrix-plot';
        plotDiv.style.height = '400px';
        container.appendChild(plotDiv);

        const zValues = data.confusion_matrix;
        const xValues = data.classes;
        const yValues = data.classes;

        const plotData = [{
            z: zValues,
            x: xValues,
            y: yValues,
            type: 'heatmap',
            colorscale: 'Viridis',
            showscale: true
        }];

        const layout = {
            title: 'Confusion Matrix',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: '#888'
            }
        };

        if (window.Plotly) {
            Plotly.newPlot('confusion-matrix-plot', plotData, layout);
        } else {
            plotDiv.innerText = "Plotly library not found.";
        }
    }

    renderRegressionMetrics(data, container) {
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-4 mb-6';

        const metrics = [
            { label: 'MSE', value: data.mse },
            { label: 'RMSE', value: data.rmse },
            { label: 'R² Score', value: data.r2 }
        ];

        metrics.forEach(m => {
            const card = document.createElement('div');
            card.className = 'card p-4 text-center';
            card.innerHTML = `<div class="text-2xl font-bold">${m.value}</div><div class="text-xs text-muted uppercase">${m.label}</div>`;
            grid.appendChild(card);
        });
        container.appendChild(grid);

        // Scatter Plot: Actual vs Predicted
        const plotDiv = document.createElement('div');
        plotDiv.id = 'regression-plot';
        plotDiv.style.height = '400px';
        container.appendChild(plotDiv);

        const trace1 = {
            x: Array.from({ length: data.y_true.length }, (_, i) => i),
            y: data.y_true,
            mode: 'lines+markers',
            name: 'Actual'
        };

        const trace2 = {
            x: Array.from({ length: data.y_pred.length }, (_, i) => i),
            y: data.y_pred,
            mode: 'lines+markers',
            name: 'Predicted'
        };

        const layout = {
            title: 'Actual vs Predicted',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#888' }
        };

        if (window.Plotly) {
            Plotly.newPlot('regression-plot', [trace1, trace2], layout);
        }
    }

    renderSplitInfo(data, container) {
        const div = document.createElement('div');
        div.className = 'flex justify-center items-center h-40';
        div.innerHTML = `
            <div class="text-center">
                <div class="text-5xl font-bold text-primary mb-2">✂️</div>
                <div class="text-lg">Data Split Successfully</div>
                <div class="mt-4 flex gap-8">
                    <div>
                        <div class="font-bold text-xl">${data.train_shape[0]}</div>
                        <div class="text-sm text-muted">Training Samples</div>
                    </div>
                    <div>
                         <div class="font-bold text-xl">${data.test_shape[0]}</div>
                        <div class="text-sm text-muted">Test Samples</div>
                    </div>
                </div>
            </div>
         `;
        container.appendChild(div);
    }

    renderModelCard(data, container) {
        const div = document.createElement('div');
        div.className = 'p-6 bg-secondary rounded-lg border border-border';
        div.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="p-3 bg-primary rounded-full text-primary-foreground mr-4">🤖</div>
                <div>
                    <h4 class="text-lg font-bold">${data.algorithm}</h4>
                    <p class="text-sm text-muted">Task: ${data.task}</p>
                </div>
            </div>
            <div class="space-y-2">
                <h5 class="text-sm font-semibold uppercase text-muted">Hyperparameters:</h5>
                <pre class="bg-card p-4 rounded text-xs font-mono overflow-auto">${JSON.stringify(data.params, null, 2)}</pre>
            </div>
         `;
        container.appendChild(div);
    }
}

// Global instance
window.visualizer = new Visualizer();
