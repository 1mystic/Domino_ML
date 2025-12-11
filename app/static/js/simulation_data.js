/**
 * simulation_data.js
 * Contains mock datasets and predefined results for the DominoML Simulator.
 */

const SIMULATION_DATA = {
    // === RAW DATASETS ===
    datasets: {
        'iris': {
            name: "Iris Dataset",
            columns: ["sepal_length", "sepal_width", "petal_length", "petal_width", "target"],
            data: [
                [5.1, 3.5, 1.4, 0.2, "setosa"],
                [4.9, 3.0, 1.4, 0.2, "setosa"],
                [4.7, 3.2, 1.3, 0.2, "setosa"],
                [7.0, 3.2, 4.7, 1.4, "versicolor"],
                [6.4, 3.2, 4.5, 1.5, "versicolor"],
                [6.9, 3.1, 4.9, 1.5, "versicolor"],
                [6.3, 3.3, 6.0, 2.5, "virginica"],
                [5.8, 2.7, 5.1, 1.9, "virginica"],
                [7.1, 3.0, 5.9, 2.1, "virginica"]
            ],
            shape: [150, 5],
            description: "Classic dataset for classification. 3 classes of Iris plants."
        },
        'wine': {
            name: "Wine Quality",
            columns: ["alcohol", "malic_acid", "ash", "alcalinity", "magnesium", "target"],
            data: [
                [14.23, 1.71, 2.43, 15.6, 127, "class_0"],
                [13.20, 1.78, 2.14, 11.2, 100, "class_0"],
                [13.16, 2.36, 2.67, 18.6, 101, "class_1"],
                [14.37, 1.95, 2.50, 16.8, 113, "class_1"],
                [13.24, 2.59, 2.87, 21.0, 118, "class_2"],
                [14.20, 1.76, 2.45, 15.2, 112, "class_2"]
            ],
            shape: [178, 13],
            description: "Chemical analysis of wines grown in Italy."
        },
        'titanic': {
            name: "Titanic",
            columns: ["pclass", "sex", "age", "sibsp", "parch", "fare", "survived"],
            data: [
                [3, "male", 22.0, 1, 0, 7.25, 0],
                [1, "female", 38.0, 1, 0, 71.28, 1],
                [3, "female", 26.0, 0, 0, 7.92, 1],
                [1, "female", 35.0, 1, 0, 53.10, 1],
                [3, "male", 35.0, 0, 0, 8.05, 0]
            ],
            shape: [891, 7],
            description: "Passenger survival data from the Titanic."
        },
        'housing': {
            name: "Housing Data (Regression)",
            columns: ["size_sqft", "bedrooms", "age", "location_score", "price"],
            data: [
                [1500, 3, 10, 8.5, 450000],
                [2100, 4, 15, 7.0, 520000],
                [900, 2, 5, 9.0, 380000],
                [3000, 5, 20, 6.5, 750000],
                [1800, 3, 12, 8.0, 490000]
            ],
            shape: [500, 5],
            description: "House prices based on size and features."
        },
        'breast_cancer': {
            name: "Breast Cancer Diagnostic",
            columns: ["mean radius", "mean texture", "mean perimeter", "mean area", "target"],
            data: [
                [17.99, 10.38, 122.8, 1001.0, "malignant"],
                [20.57, 17.77, 132.9, 1326.0, "malignant"],
                [19.69, 21.25, 130.0, 1203.0, "malignant"],
                [11.42, 20.38, 77.58, 386.1, "benign"],
                [12.45, 15.70, 82.57, 477.1, "benign"]
            ],
            shape: [569, 30],
            description: "Features computed from a digitized image of a breast mass."
        },
        'digits': {
            name: "Handwritten Digits",
            columns: ["pixel_0_0", "pixel_0_1", "pixel_0_2", "...", "target"],
            data: [
                [0, 0, 5, 13, 9, 1, 0, 0],
                [0, 0, 0, 12, 13, 5, 0, 0],
                [0, 0, 0, 4, 15, 30, 0, 0]
            ],
            shape: [1797, 64],
            description: "Optical recognition of handwritten digits."
        },
        'text_data': {
            name: "20 Newsgroups (Subset)",
            columns: ["text", "category"],
            data: [
                ["Computer graphics is amazing", "comp.graphics"],
                ["The shuttle launch was successful", "sci.space"],
                ["I need a new hard drive", "comp.sys.ibm.pc.hardware"],
                ["The moon orbits the earth", "sci.space"]
            ],
            shape: [200, 1],
            description: "Collection of newsgroup documents."
        }
    },

    // === MODEL RESULTS ===
    models: {
        'classification': {
            accuracy: 0.9667,
            confusion_matrix: [
                [19, 0, 0],
                [0, 15, 1],
                [0, 0, 15]
            ],
            classes: ["setosa", "versicolor", "virginica"],
            report: {
                "setosa": { precision: 1.00, recall: 1.00, f1: 1.00 },
                "versicolor": { precision: 1.00, recall: 0.94, f1: 0.97 },
                "virginica": { precision: 0.94, recall: 1.00, f1: 0.97 }
            }
        },
        'text_classification': {
            accuracy: 0.85,
            confusion_matrix: [
                [45, 5, 0],
                [8, 38, 4],
                [1, 2, 47]
            ],
            classes: ["comp.graphics", "sci.space", "comp.sys.hardware"],
            report: {
                "comp.graphics": { precision: 0.83, recall: 0.90, f1: 0.86 },
                "sci.space": { precision: 0.84, recall: 0.76, f1: 0.80 },
                "comp.sys.hardware": { precision: 0.92, recall: 0.94, f1: 0.93 }
            }
        },
        'regression': {
            mse: 12.45, // Mean Squared Error
            rmse: 3.52, // Root MSE
            r2: 0.89,   // R-squared
            y_true: [10, 20, 30, 40, 50, 60, 70, 80],
            y_pred: [11, 19, 32, 38, 51, 62, 68, 81]
        },
        'clustering': {
            n_clusters: 3,
            silhouette_score: 0.72,
            cluster_centers: [
                [5.0, 3.4, 1.5, 0.2],
                [6.2, 2.9, 4.3, 1.3],
                [6.9, 3.1, 5.5, 2.1]
            ]
        }
    },

    // === COMPONENT METADATA ===
    // Used to simulate transformations
    transformations: {
        'standard_scaler': {
            description: "Data centered (mean=0) and scaled (std=1)",
            effect: " Values are now typically between -3 and 3."
        },
        'min_max_scaler': {
            description: "Data scaled to range [0, 1]",
            effect: " All values are now positive and <= 1."
        },
        'pca': {
            description: "Dimensionality reduced using PCA",
            effect: " Features transformed into Principal Components."
        },
        'one_hot_encoder': {
            description: "Categorical variables converted to binary columns",
            effect: " Increased number of features."
        },
        'label_encoder': {
            description: "Target labels encoded as integers",
            effect: " Converted strings to numbers [0, 1, 2...]"
        },
        'tfidf_vectorizer': {
            description: "Text converted to TF-IDF matrix",
            effect: " Converted text to sparse numerical matrix."
        }
    }
};
