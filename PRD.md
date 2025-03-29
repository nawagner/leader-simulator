# Product Requirements Document: GeoPolitical Network Analysis MVP

## Executive Summary

This document outlines the requirements for a Minimum Viable Product (MVP) that creates a digital twin for geopolitical network analysis of world leaders. The application will allow users to analyze a leader's social and political network, identify vulnerabilities, and forecast potential geopolitical strategies based on network evolution.

## Goals and Objectives

- Create a dynamic visualization of a world leader's network
- Identify potential vulnerabilities within the leader's network
- Enable basic scenario planning to forecast network changes
- Provide time-series analysis of network evolution
- Deliver a simple, practical solution with modern technologies

## Technology Stack

- **Frontend**: Next.js with shadcn UI components
- **Backend**: Python (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Vercel AI SDK
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## User Personas

1. **Political Analysts**: Need to understand leader networks and predict behavior
2. **Diplomats**: Require insights into leadership dynamics before negotiations
3. **Security Researchers**: Need to identify vulnerabilities in political networks

## Core Features

### 1. Leader & Data Source Management

- Create and manage profiles for world leaders
- Configure data sources for network analysis (news outlets, social media)
- Schedule data collection frequency

### 2. Dynamic Network Visualization

- Interactive network graph showing entities and relationships
- Color-coded nodes representing different types of entities (allies, adversaries)
- Edge thickness indicating relationship strength
- Filtering options by relationship type, time period, and entity category

### 3. Vulnerability Analysis Dashboard

- Calculate and display key network metrics:
  - Centrality measures (degree, betweenness, closeness)
  - Structural holes
  - Community cohesion
- Highlight potential vulnerabilities based on these metrics
- Show sentiment analysis of key relationships

### 4. Basic Scenario Planning

- Allow users to modify network connections (add/remove/strengthen/weaken)
- Simulate the impact of these changes on the overall network
- Provide basic forecasting of how changes might affect a leader's strategy

### 5. Time Series Analysis

- Track and visualize network evolution over time
- Display trends in key relationships and network metrics
- Show correlation between network changes and major political events

## Technical Implementation

### Data Pipeline

1. **Data Collection**:
   - API integration with news aggregators
   - Limited social media data collection
   - Manual input option for other data sources

2. **Text Processing**:
   - Named Entity Recognition (using SpaCy)
   - Relation Extraction (using HuggingFace Transformers)
   - Sentiment Analysis (using NLTK)

3. **Network Construction**:
   - Build network graph using NetworkX
   - Store network data in Supabase
   - Update network incrementally with new data

### Frontend Components

1. **Network Visualization**:
   - React Flow for interactive network graphs
   - shadcn UI components for controls and filters
   - Responsive design for different screen sizes

2. **Dashboards**:
   - Metric cards showing key network statistics
   - Charts for time series data
   - Alert components for vulnerability highlights

3. **Scenario Planning Interface**:
   - Form components for modifying network connections
   - Split view showing original vs. modified network
   - Results panel showing impact analysis

## API Endpoints

```
GET /api/leaders - Get all leader profiles
POST /api/leaders - Create a new leader profile
GET /api/leaders/{id} - Get a specific leader profile
GET /api/leaders/{id}/network - Get the network for a leader
POST /api/leaders/{id}/scenarios - Create a new scenario
GET /api/leaders/{id}/vulnerabilities - Get vulnerability analysis
GET /api/leaders/{id}/timeline - Get time series data
```

## Database Schema

```
leaders (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  position TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

entities (
  id UUID PRIMARY KEY,
  leader_id UUID REFERENCES leaders(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  importance INTEGER DEFAULT 0
)

relationships (
  id UUID PRIMARY KEY,
  leader_id UUID REFERENCES leaders(id),
  source_id UUID REFERENCES entities(id),
  target_id UUID REFERENCES entities(id),
  type TEXT NOT NULL,
  sentiment FLOAT,
  strength FLOAT,
  timestamp TIMESTAMP DEFAULT NOW()
)

data_sources (
  id UUID PRIMARY KEY,
  leader_id UUID REFERENCES leaders(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  active BOOLEAN DEFAULT TRUE
)

scenarios (
  id UUID PRIMARY KEY,
  leader_id UUID REFERENCES leaders(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

scenario_changes (
  id UUID PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id),
  relationship_id UUID REFERENCES relationships(id),
  change_type TEXT NOT NULL,
  new_sentiment FLOAT,
  new_strength FLOAT
)
```

## User Flows

### Core User Flow

1. User logs in and selects a world leader to analyze
2. System displays the current network visualization
3. User can browse the vulnerability dashboard
4. User can create a scenario by modifying network connections
5. System simulates and displays the impact of these changes
6. User can view the time series analysis of network evolution

## MVP Scope Limitations

To ensure a practical and simple initial implementation:

1. **Limited Data Sources**: Focus on a few high-quality news sources rather than comprehensive social media analysis
2. **Manual Entity Verification**: Allow users to verify and correct automatically detected entities
3. **Basic Forecasting**: Use simple network metrics rather than complex agent-based modeling
4. **Limited Historical Data**: Start with recent data (last 6 months) rather than extensive historical analysis
5. **Focus on Single Leader**: Initially focus on analyzing one leader at a time

## Technical Implementation Diagram

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│  Data Sources  │─────▶│ Python Backend │◀────▶│   Supabase     │
│                │      │                │      │                │
└────────────────┘      └───────┬────────┘      └────────────────┘
                               │
                               ▼
                        ┌────────────────┐
                        │                │
                        │  Next.js UI    │
                        │                │
                        └────────────────┘
                               │
                               ▼
                        ┌────────────────┐
                        │                │
                        │  User Browser  │
                        │                │
                        └────────────────┘
```

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up project infrastructure
- Implement authentication
- Create basic database schema
- Build simple leader profile management

### Phase 2: Data Pipeline (Weeks 3-4)
- Implement data collection from selected sources
- Set up NLP processing pipeline
- Create network construction logic

### Phase 3: Network Visualization (Weeks 5-6)
- Implement network visualization
- Create basic metrics dashboard
- Build time series visualization

### Phase 4: Analysis Features (Weeks 7-8)
- Implement vulnerability analysis
- Create scenario planning interface
- Add basic forecasting capabilities

### Phase 5: Testing & Refinement (Weeks 9-10)
- User testing
- Performance optimization
- Bug fixes and refinements

## Success Metrics

- Users can successfully visualize a leader's network
- System identifies at least 3 meaningful vulnerabilities
- Scenario planning provides insights that align with expert analysis
- Time series analysis accurately reflects known network evolution

## Future Enhancements

- Advanced agent-based modeling
- Comparative analysis between multiple leaders
- Integration with more data sources
- Machine learning for improved predictions
- Customizable alert system