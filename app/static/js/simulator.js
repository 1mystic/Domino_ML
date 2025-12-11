/**
 * simulator.js
 * Frontend engine for simulating pipeline execution logic.
 */

class Simulator {
    constructor() {
        this.results = new Map(); // Store results for each node
        this.status = 'idle';
    }

    /**
     * Run the simulation for the current pipeline
     */
    async run(nodes, edges) {
        console.log("Starting simulation...");
        this.status = 'running';
        this.results.clear();

        try {
            const sortedNodes = this.sortNodes(nodes, edges);

            for (const node of sortedNodes) {
                await this.executeNode(node, nodes, edges);
            }

            console.log("Simulation complete!");
            return this.results;

        } catch (error) {
            console.error("Simulation failed:", error);
            throw error;
        } finally {
            this.status = 'idle';
        }
    }

    /**
     * Execute a single node logic
     */
    async executeNode(node, allNodes, edges) {
        await new Promise(r => setTimeout(r, 600)); // Simulate delay

        const inputs = this.getNodeInputs(node.id, edges);
        const nodeType = node.data.componentId || node.type;

        // --- VALIDATION ---
        this.validateInputs(node, nodeType, inputs);

        // --- LOGIC DISPATCHER ---
        let result = null;

        // 1. DATA SOURCES
        if (['csv-loader', 'sample-data', 'text-loader'].includes(nodeType)) {
            result = this.simulateLoader(node);
        }

        // 2. PREPROCESSING
        else if (['standard-scaler', 'min-max-scaler', 'pca', 'one-hot-encoder', 'label-encoder', 'tfidf-vectorizer'].includes(nodeType)) {
            result = this.simulatePreprocessing(node, inputs[0]);
        }
        else if (nodeType === 'train-test-split') {
            result = this.simulateSplit(node, inputs[0]);
        }

        // 3. MODELS (CLASSIFICATION)
        else if (['random-forest-classifier', 'logistic-regression', 'svm-classifier', 'knn-classifier',
            'gradient-boosting-classifier', 'mlp-classifier', 'decision-tree-classifier', 'naive-bayes'].includes(nodeType)) {
            result = this.simulateModelTraining(node, inputs, 'classification');
        }

        // 4. MODELS (REGRESSION)
        else if (['linear-regression', 'random-forest-regressor'].includes(nodeType)) {
            result = this.simulateModelTraining(node, inputs, 'regression');
        }

        // 5. MODELS (CLUSTERING)
        else if (['kmeans-clustering'].includes(nodeType)) {
            result = this.simulateClustering(node, inputs);
        }

        // 6. EVALUATION
        else if (['classification-metrics', 'regression-metrics', 'confusion-matrix', 'cross-validation'].includes(nodeType)) {
            result = this.simulateEvaluation(node, inputs);
        }

        // Fallback for unknown nodes
        if (!result) {
            console.warn(`No simulation logic for node type: ${nodeType}`);
            result = {
                type: 'unknown',
                preview: 'table',
                data: [],
                columns: ['Notice'],
                note: 'Logic not implemented'
            };
        }

        // Store result
        this.results.set(node.id, {
            nodeId: node.id,
            nodeName: node.data.label,
            type: nodeType,
            data: result,
            timestamp: new Date()
        });

        // Trigger UI update event
        document.dispatchEvent(new CustomEvent('simulation-node-complete', {
            detail: { nodeId: node.id, result }
        }));
    }

    // --- LOGIC HELPERS ---

    validateInputs(node, type, inputs) {
        // Basic check: Models and Transformers need input data
        if (!['csv-loader', 'sample-data', 'text-loader'].includes(type)) {
            if (inputs.length === 0) {
                throw new Error(`Node '${node.data.label}' is missing input connection.`);
            }
        }
        // Task sanity check
        if (type === 'classification-metrics') {
            const model = inputs.find(i => i.type === 'model' || (i.data && i.data.type === 'model'));
            if (model && model.data.task === 'regression') {
                throw new Error("Invalid Connection: Cannot use Classification Metrics on a Regression Model.");
            }
        }
        if (type === 'regression-metrics') {
            const model = inputs.find(i => i.type === 'model' || (i.data && i.data.type === 'model'));
            if (model && model.data.task === 'classification') {
                throw new Error("Invalid Connection: Cannot use Regression Metrics on a Classification Model.");
            }
        }
    }

    simulateLoader(node) {
        let key = 'iris';
        let taskType = 'classification';

        if (node.data.componentId === 'csv-loader') {
            key = 'iris'; // Default for custom CSV in simulation
        } else if (node.data.componentId === 'text-loader') {
            key = 'text_data';
            taskType = 'text_classification';
        } else {
            // Sample Data
            key = (node.parameters?.dataset || 'iris').toLowerCase();
            if (key.includes('housing') || key.includes('price')) taskType = 'regression';
            if (key.includes('breast') || key.includes('digits')) taskType = 'classification';
        }

        const dataset = SIMULATION_DATA.datasets[key] || SIMULATION_DATA.datasets['iris'];
        return {
            ...dataset,
            type: 'dataset',
            preview: 'table',
            taskType: taskType
        };
    }

    simulatePreprocessing(node, inputData) {
        if (!inputData || !inputData.data) return null;
        const dataset = inputData.data;
        const opId = node.data.componentId.replace(/-/g, '_');

        // Metadata
        const meta = SIMULATION_DATA.transformations[opId] || { effect: "Processed" };

        // Clone data
        // If text data, we can't deep clone easily if structure differs, but let's assume table-like for now
        let transformedRows = dataset.data;
        try {
            transformedRows = JSON.parse(JSON.stringify(dataset.data));
        } catch (e) { /* ignore */ }

        // Specific mock logic
        if (opId === 'tfidf_vectorizer') {
            // Mock turning text into numbers
            transformedRows = transformedRows.slice(0, 5).map((row, i) => Array(10).fill(0).map(() => Math.random()));
            dataset.columns = Array(10).fill(0).map((_, i) => `term_${i}`);
            dataset.note = "Converted text to sparse matrix (mocked)";
        }
        else if (opId === 'standard_scaler' || opId === 'min_max_scaler') {
            // Simple shift
            if (Array.isArray(transformedRows) && Array.isArray(transformedRows[0])) {
                transformedRows.forEach(row => {
                    for (let i = 0; i < row.length - 1; i++) {
                        if (typeof row[i] === 'number') row[i] = (row[i] - 3.0) / 1.5;
                    }
                });
            }
        }

        return {
            ...dataset,
            data: transformedRows,
            note: meta.effect,
            preview: 'table',
            taskType: inputData.taskType
        };
    }

    simulateSplit(node, inputData) {
        if (!inputData || !inputData.data) return null;
        const dataset = inputData.data;

        const testSize = node.parameters?.test_size || 0.2;
        const totalRows = dataset.data ? dataset.data.length : 0;
        const splitIndex = Math.floor(totalRows * (1 - testSize));

        return {
            train_shape: [splitIndex, dataset.shape[1]],
            test_shape: [totalRows - splitIndex, dataset.shape[1]],
            preview: 'split_info',
            type: 'split_data',
            taskType: inputData.taskType
        };
    }

    simulateModelTraining(node, inputs, type) {
        return {
            type: 'model',
            algorithm: node.data.label,
            params: node.parameters,
            task: type,
            preview: 'model_card'
        };
    }

    simulateClustering(node, inputs) {
        return {
            type: 'model',
            algorithm: 'K-Means',
            task: 'clustering',
            clusters: SIMULATION_DATA.models.clustering,
            preview: 'clustering_result'
        };
    }

    simulateEvaluation(node, inputs) {
        const modelInput = inputs.find(i => i.type === 'model' || (i.data && i.data.type === 'model'));
        if (!modelInput) throw new Error("Evaluation requires a trained model input.");

        const task = modelInput.data.task;

        if (node.data.componentId === 'cross-validation') {
            // Return CV scores
            const cv = node.parameters?.cv || 5;
            const scores = Array(parseInt(cv)).fill(0).map(() => 0.8 + Math.random() * 0.15);
            return {
                scores: scores,
                mean: scores.reduce((a, b) => a + b) / scores.length,
                preview: 'cross_validation'
            };
        }

        // Check compatibility again just in case
        if (task === 'regression' && node.data.componentId === 'classification-metrics')
            throw new Error("Task Mismatch: Regression Model vs Classification Metrics");

        // Pick result data
        if (task === 'text_classification') {
            return { ...SIMULATION_DATA.models.text_classification, type: 'metrics', preview: 'classification_report' };
        } else if (task === 'regression') {
            return { ...SIMULATION_DATA.models.regression, type: 'metrics', preview: 'regression_report' };
        } else {
            return { ...SIMULATION_DATA.models.classification, type: 'metrics', preview: 'classification_report' };
        }
    }

    getNodeInputs(nodeId, edges) {
        const inputEdges = edges.filter(e => e.target === nodeId);
        return inputEdges.map(e => this.results.get(e.source)).filter(r => r);
    }

    sortNodes(nodes, edges) {
        // Simple Topo Sort (Khan's Algo)
        const sorted = [];
        const inDegree = new Map();
        const graph = new Map();

        nodes.forEach(n => {
            inDegree.set(n.id, 0);
            graph.set(n.id, []);
        });

        edges.forEach(e => {
            if (graph.has(e.source) && graph.has(e.target)) {
                graph.get(e.source).push(e.target);
                inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
            }
        });

        const queue = nodes.filter(n => inDegree.get(n.id) === 0);

        while (queue.length > 0) {
            const n = queue.shift();
            sorted.push(n);

            if (graph.has(n.id)) {
                graph.get(n.id).forEach(neighbor => {
                    inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                    if (inDegree.get(neighbor) === 0) {
                        const neighborNode = nodes.find(node => node.id === neighbor);
                        if (neighborNode) queue.push(neighborNode);
                    }
                });
            }
        }

        if (sorted.length !== nodes.length) throw new Error("Cycle detected in pipeline");
        return sorted;
    }
}

// Global instance
window.simulator = new Simulator();
