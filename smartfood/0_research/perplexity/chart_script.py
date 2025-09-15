import plotly.graph_objects as go
import plotly.express as px
import json
import pandas as pd
import numpy as np

# Load the project data
data_json = {"projects": [{"name": "Smart Traffic Light Optimizer", "category": "Conservative", "domain": "Mobility", "feasibility": 9, "impact": 7, "demo_complexity": 6}, {"name": "Predictive Public Transit", "category": "Conservative", "domain": "Mobility", "feasibility": 9, "impact": 8, "demo_complexity": 6}, {"name": "Smart Parking Management", "category": "Conservative", "domain": "Mobility", "feasibility": 9, "impact": 7, "demo_complexity": 3}, {"name": "Quality Control AI Inspector", "category": "Conservative", "domain": "Food", "feasibility": 9, "impact": 8, "demo_complexity": 6}, {"name": "Predictive Equipment Maintenance", "category": "Conservative", "domain": "Food", "feasibility": 9, "impact": 7, "demo_complexity": 6}, {"name": "Intelligent Inventory Optimization", "category": "Conservative", "domain": "Food", "feasibility": 9, "impact": 7, "demo_complexity": 3}, {"name": "AI Urban Mobility Orchestrator", "category": "Disruptive", "domain": "Mobility", "feasibility": 6, "impact": 10, "demo_complexity": 9}, {"name": "Autonomous Fleet Coordination", "category": "Disruptive", "domain": "Mobility", "feasibility": 6, "impact": 10, "demo_complexity": 9}, {"name": "Carbon-Optimal Route Intelligence", "category": "Disruptive", "domain": "Mobility", "feasibility": 6, "impact": 9, "demo_complexity": 6}, {"name": "Autonomous Food Factory", "category": "Disruptive", "domain": "Food", "feasibility": 6, "impact": 10, "demo_complexity": 9}, {"name": "AI-Driven Sustainable Food Design", "category": "Disruptive", "domain": "Food", "feasibility": 8, "impact": 9, "demo_complexity": 3}, {"name": "Global Food Supply Chain Intelligence", "category": "Disruptive", "domain": "Food", "feasibility": 6, "impact": 9, "demo_complexity": 6}]}

# Convert to DataFrame
df = pd.DataFrame(data_json['projects'])

# Add slight jitter to avoid overlapping points
np.random.seed(42)  # For reproducible results
df['feasibility_jitter'] = df['feasibility'] + np.random.normal(0, 0.1, len(df))
df['impact_jitter'] = df['impact'] + np.random.normal(0, 0.1, len(df))

# Create abbreviated names for hover (keeping key words)
def abbreviate_name(name):
    if len(name) <= 15:
        return name
    # Keep key words and abbreviate
    words = name.split()
    if len(words) <= 2:
        return name[:15]
    return f"{words[0]} {words[-1]}"[:15]

df['short_name'] = df['name'].apply(abbreviate_name)

# Create the figure
fig = go.Figure()

# Define colors and markers based on domain and category
colors = {'Mobility': '#1FB8CD', 'Food': '#2E8B57'}  # Blue for Mobility, Green for Food
markers = {'Mobility': 'circle', 'Food': 'square'}

# Calculate marker size (inverse of demo_complexity, normalized)
df['marker_size'] = (11 - df['demo_complexity']) * 4 + 12  # Smaller complexity = larger size

# Add traces for each combination
for domain in ['Mobility', 'Food']:
    for category in ['Conservative', 'Disruptive']:
        subset = df[(df['domain'] == domain) & (df['category'] == category)]
        
        if len(subset) > 0:
            # Set line properties for outlined (disruptive) vs solid (conservative)
            if category == 'Disruptive':
                line_color = colors[domain]
                line_width = 3
                fill_color = 'rgba(255,255,255,0.8)'
            else:
                line_color = colors[domain]
                line_width = 0
                fill_color = colors[domain]
            
            fig.add_trace(go.Scatter(
                x=subset['feasibility_jitter'],
                y=subset['impact_jitter'],
                mode='markers',
                marker=dict(
                    symbol=markers[domain],
                    size=subset['marker_size'],
                    color=fill_color,
                    line=dict(color=line_color, width=line_width),
                    opacity=0.8
                ),
                name=f'{domain} {category}',
                hovertemplate='<b>%{customdata}</b><br>' +
                            'Feasibility: %{x:.1f}<br>' +
                            'Impact: %{y:.1f}<br>' +
                            'Demo Complexity: %{text}<br>' +
                            '<extra></extra>',
                customdata=subset['name'],
                text=subset['demo_complexity']
            ))

# Update layout
fig.update_layout(
    title='Project Selection Matrix',
    xaxis_title='Feasibility',
    yaxis_title='Impact',
    legend=dict(
        orientation='h', 
        yanchor='bottom', 
        y=1.05, 
        xanchor='center', 
        x=0.5,
        itemsizing='constant'
    ),
    showlegend=True,
    hovermode='closest'
)

# Update axes with better ranges and gridlines
fig.update_xaxes(
    range=[5.5, 9.5], 
    title='Feasibility',
    showgrid=True,
    gridcolor='lightgray',
    gridwidth=1
)
fig.update_yaxes(
    range=[6.5, 10.5], 
    title='Impact',
    showgrid=True,
    gridcolor='lightgray',
    gridwidth=1
)

# Update traces
fig.update_traces(cliponaxis=False)

# Save the chart
fig.write_image("project_matrix.png")
fig.write_image("project_matrix.svg", format="svg")

fig.show()