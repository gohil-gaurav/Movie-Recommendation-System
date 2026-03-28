# Backend Structure

This folder contains the production-ready backend layout following clean architecture.

```
backend/
|-- app/                # Application package
|   |-- api/             # FastAPI routes and request handlers
|   |-- services/        # Business logic (ML + TMDB integration)
|   |-- core/            # Configuration, settings, startup
|   |-- schemas/         # Pydantic request/response models
|   |-- repositories/    # Data access layer and persistence logic
|   `-- utils/           # Shared helpers and utilities
|-- data/               # ML artifacts (e.g., .pkl models)
|-- .env                # Environment variables
`-- requirements.txt    # Python dependencies
```
