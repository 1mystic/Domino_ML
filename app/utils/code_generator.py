def topological_sort(nodes, edges):
    """Perform topological sort on nodes based on edges"""
    # Create adjacency list and in-degree count
    graph = {node['id']: [] for node in nodes}
    in_degree = {node['id']: 0 for node in nodes}
    
    # Build graph
    for edge in edges:
        graph[edge['source']].append(edge['target'])
        in_degree[edge['target']] += 1
    
    # Find nodes with no incoming edges
    queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
    result = []
    
    # Kahn's algorithm
    while queue:
        node_id = queue.pop(0)
        node = next((n for n in nodes if n['id'] == node_id), None)
        if node:
            result.append(node)
        
        for neighbor in graph[node_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    return result

def generate_python_code(nodes, edges, pipeline_name):
    """Generate Python code from ML pipeline nodes and edges"""
    if not nodes:
        return '# No nodes in pipeline\nprint("Please add components to your pipeline first!")'
    
    # Load components to get templates
    from app.utils.data_loader import get_components
    comp_data = get_components()
    components_list = comp_data.get('components', [])
    components = {comp['id']: comp for comp in components_list}
    
    # Sort nodes topologically
    sorted_nodes = topological_sort(nodes, edges)
    
    code = f"# {pipeline_name}\n# Generated ML Pipeline Code\n\n"
    
    # Collect imports
    imports = set()
    for node in sorted_nodes:
        # Find matching component by componentId or name
        component_id = node.get('data', {}).get('componentId')
        component = components.get(component_id)
        
        if not component:
            # Fallback: try to match by name
            component = next((c for c in components.values() if c['name'] == node.get('name')), None)
        
        if component and 'pythonTemplate' in component:
            template_lines = component['pythonTemplate'].split('\n')
            for line in template_lines:
                line = line.strip()
                if line.startswith('from ') or line.startswith('import '):
                    imports.add(line)
    
    code += '\n'.join(sorted(imports)) + '\n\n'
    
    # Add main pipeline code
    code += '# Main Pipeline\n'
    code += 'def run_ml_pipeline():\n'
    code += '    """Execute the complete ML pipeline"""\n'
    code += '    print("Starting ML Pipeline execution...")\n    \n'
    
    for index, node in enumerate(sorted_nodes):
        component_id = node.get('data', {}).get('componentId')
        component = components.get(component_id)
        
        if not component:
            # Fallback: try to match by name
            component = next((c for c in components.values() if c['name'] == node.get('name')), None)
        
        if component and 'pythonTemplate' in component:
            code += f'    # Step {index + 1}: {node["data"]["label"]}\n'
            code += f'    print("Step {index + 1}: {node["data"]["label"]}")\n'
            
            node_code = component['pythonTemplate']
            
            # Replace parameters in template
            if 'parameters' in node['data']:
                for key, value in node['data']['parameters'].items():
                    placeholder = '{' + key + '}'
                    if isinstance(value, str):
                        replacement = f"'{value}'"
                    elif isinstance(value, bool):
                        replacement = 'True' if value else 'False'
                    else:
                        replacement = str(value)
                    node_code = node_code.replace(placeholder, replacement)
            
            # Indent the code
            indented_code = '\n'.join(
                f'    {line}' for line in node_code.split('\n') if line.strip()
            )
            code += indented_code + '\n    \n'
    
    code += '    print("Pipeline execution completed!")\n\n'
    code += '# Execute the pipeline\n'
    code += 'if __name__ == "__main__":\n'
    code += '    run_ml_pipeline()\n'
    
    return code
