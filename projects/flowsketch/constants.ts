import { DiagramType } from './types';

export const INITIAL_DIAGRAM_CODE = `graph TD
    User((User)) -->|Requests Feature| FE[Frontend App]
    FE -->|API Call| API[API Gateway]
    API -->|Auth Check| Auth[Auth Service]
    API -->|Route Request| Svc[Core Service]
    Svc -->|Query| DB[(Database)]
    Svc -->|Cache| Redis[Redis Cache]
    style User fill:#fff,stroke:#333,stroke-width:2px
    style FE fill:#eef,stroke:#333,stroke-width:2px
    style API fill:#eef,stroke:#333,stroke-width:2px
    style DB fill:#efe,stroke:#333,stroke-width:2px`;
