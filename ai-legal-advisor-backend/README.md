AI Legal Advisor App/
├── AILegealAdvisor/           # Frontend (React Native Expo)
└── ai-legal-advisor-backend/  # Backend (NestJS)
    ├── src/
    │   ├── auth/         # Auth0 integration
    │   ├── collections/  # Collection management
    │   ├── documents/    # Document processing
    │   ├── rag/         # RAG system implementation
    │   ├── storage/     # File storage (S3)
    │   ├── prisma/      # Database access
    │   ├── app.module.ts
    │   └── main.ts
    ├── prisma/
    │   └── schema.prisma # Database schema
    └── .env             # Environment variables