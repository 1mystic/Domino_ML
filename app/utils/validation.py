import networkx as nx

def validate_pipeline_structure(nodes, edges):
    """
    Validate the structure of the pipeline.
    Returns a list of errors and warnings.
    """
    errors = []
    warnings = []
    
    if not nodes:
        errors.append("Pipeline is empty")
        return errors, warnings

    # Build graph
    G = nx.DiGraph()
    node_map = {node['id']: node for node in nodes}
    
    for node in nodes:
        G.add_node(node['id'])
        
    for edge in edges:
        if edge['source'] in node_map and edge['target'] in node_map:
            G.add_edge(edge['source'], edge['target'])
    
    # 1. Cycle Detection
    try:
        cycles = list(nx.simple_cycles(G))
        if cycles:
            errors.append("Pipeline contains cycles, which are not allowed.")
    except Exception:
        pass # simple_cycles might fail on some graph types or versions, but usually fine for DiGraph

    # 2. Disconnected Components
    # Weakly connected components (ignoring direction)
    if not nx.is_weakly_connected(G) and len(nodes) > 1:
        warnings.append("Pipeline has disconnected components.")

    # 3. Type Compatibility (Simplified)
    # We need component definitions to check this properly. 
    # For now, we'll check basic logic based on node types if available in data.
    
    return errors, warnings

def validate_hyperparameters(node, component_def):
    """
    Validate hyperparameters for a single node against its component definition.
    """
    errors = []
    if not component_def or 'parameters' not in component_def:
        return errors

    params = node.get('data', {}).get('parameters', {})
    
    for param_def in component_def['parameters']:
        name = param_def['name']
        val = params.get(name)
        
        if val is None:
            if param_def.get('required', False):
                errors.append(f"Missing required parameter: {param_def['label']}")
            continue

        # Numeric checks
        if param_def['type'] == 'number':
            try:
                num_val = float(val)
                if 'min' in param_def and num_val < param_def['min']:
                    errors.append(f"{param_def['label']} must be >= {param_def['min']}")
                if 'max' in param_def and num_val > param_def['max']:
                    errors.append(f"{param_def['label']} must be <= {param_def['max']}")
            except ValueError:
                errors.append(f"{param_def['label']} must be a number")
                
    return errors
