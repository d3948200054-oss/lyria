# Local Memory and Vector Retrieval

To execute tasks with deep contextual awareness, IRIS implements a local memory system. Instead of relying on cloud-based vector stores, memory resides entirely on the host machine.

## The RAG Oracle

The **RAG (Retrieval-Augmented Generation) Oracle** is IRIS's embedded memory engine, powered by **LanceDB**. 

### Workflow

1. **Folder Ingestion:** Users can point IRIS to local workspaces or documentation folders.
2. **Vector Embeddings:** The system parses the files, generates high-dimensional vector embeddings locally, and stores them in the embedded LanceDB database.
3. **Semantic Search:** When a user issues a voice command requiring specific knowledge (e.g., "Look up the API keys for the payment gateway in the backend folder"), IRIS queries the local vector database, retrieves the relevant context, and injects it into the prompt.

### Privacy Guarantee

Because LanceDB runs embedded within the Electron Main Process, vector embeddings are never transmitted to external databases. All project context, source code, and private notes remain exclusively on your local disk.
