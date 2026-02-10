"""
Vector database module using ChromaDB for semantic search
"""

import time
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

try:
    from .config import (
        CHROMA_DB_PATH,
        COLLECTION_NAME,
        EMBEDDING_MODEL,
        PROCESSED_DATA_FILE,
    )
    from .utils import clean_text, timing_decorator
    from .gene_curator import CURATED_GENES
except ImportError:
    from config import (
        CHROMA_DB_PATH,
        COLLECTION_NAME,
        EMBEDDING_MODEL,
        PROCESSED_DATA_FILE,
    )
    from utils import clean_text, timing_decorator
    from gene_curator import CURATED_GENES


class VectorStore:
    """Manages ChromaDB vector database for gene-phenotype embeddings"""

    def __init__(
        self,
        persist_directory: Path = CHROMA_DB_PATH,
        embedding_model: str = EMBEDDING_MODEL,
    ):
        """
        Initialize ChromaDB client and embedding model

        Args:
            persist_directory: Path to store ChromaDB data
            embedding_model: Name of the sentence-transformers model
        """
        self.persist_directory = persist_directory
        self.embedding_model_name = embedding_model

        print(f"🔧 Initializing Vector Store...")
        print(f"  📁 Persist directory: {persist_directory}")
        print(f"  🤖 Embedding model: {embedding_model}")

        # Initialize ChromaDB client with persistence
        self.client = chromadb.PersistentClient(
            path=str(persist_directory),
            settings=Settings(anonymized_telemetry=False, allow_reset=True),
        )

        # Load embedding model
        print(f"  ⏳ Loading embedding model...")
        self.embedding_model = SentenceTransformer(embedding_model)
        print(f"  ✅ Model loaded: {embedding_model}")

    def get_or_create_collection(self):
        """Get existing collection or create new one"""
        try:
            collection = self.client.get_collection(name=COLLECTION_NAME)
            print(
                f"✅ Found existing collection '{COLLECTION_NAME}' with {collection.count()} documents"
            )
        except Exception:
            collection = self.client.create_collection(
                name=COLLECTION_NAME,
                metadata={
                    "description": "Gene-phenotype embeddings for GeneVision RAG"
                },
            )
            print(f"✅ Created new collection '{COLLECTION_NAME}'")

        return collection

    def create_embedding_text(self, gene_record: Dict, phenotype: Dict) -> str:
        """
        Create searchable text for embedding

        Combines gene information and phenotype in a semantic-rich format.
        Now includes curated phenotype_terms from gene_curator.py for better semantic matching.

        Args:
            gene_record: Gene information
            phenotype: Phenotype information

        Returns:
            Text suitable for embedding
        """
        gene_sym = gene_record.get("gene_symbol", "")
        gene_name = gene_record.get("gene_name", "")
        gene_desc = gene_record.get("description", "")

        pheno_name = phenotype.get("phenotype_name", "")
        pheno_desc = phenotype.get("phenotype_description", "")

        # Build rich text representation
        text_parts = []

        # Gene information
        if gene_sym:
            text_parts.append(f"Gene: {gene_sym}")
        if gene_name and gene_name != gene_sym:
            text_parts.append(f"({gene_name})")
        if gene_desc:
            text_parts.append(f"Function: {gene_desc}")

        # Phenotype information
        if pheno_name:
            text_parts.append(f"Phenotype: {pheno_name}")
        if pheno_desc and pheno_desc != pheno_name:
            text_parts.append(f"Description: {pheno_desc}")

        # Add curated phenotype search terms for better semantic matching
        if gene_sym in CURATED_GENES:
            curated_terms = CURATED_GENES[gene_sym].get("phenotype_terms", [])
            if curated_terms:
                # Add terms to enhance searchability (e.g., "pink fur", "red pigment")
                terms_text = ", ".join(curated_terms)
                text_parts.append(f"Related traits: {terms_text}")

        text = ". ".join(text_parts)
        return clean_text(text)

    @timing_decorator
    def ingest_gene_data(self, gene_data: Dict[str, Dict]):
        """
        Ingest gene-phenotype data into ChromaDB

        Creates one embedding per gene-phenotype pair for granular matching

        Args:
            gene_data: Dictionary of gene data keyed by gene_symbol
        """
        collection = self.get_or_create_collection()

        print(f"\n🔄 Ingesting gene-phenotype data...")

        documents = []
        embeddings = []
        metadatas = []
        ids = []

        doc_id = 0

        for gene_sym, gene_record in gene_data.items():
            phenotypes = gene_record.get("phenotypes", [])

            for phenotype in phenotypes:
                # Create embedding text
                text = self.create_embedding_text(gene_record, phenotype)

                if not text:
                    continue

                # Generate embedding
                embedding = self.embedding_model.encode(text).tolist()

                # Create metadata (must be simple types for ChromaDB)
                metadata = {
                    "gene_symbol": gene_sym,
                    "gene_name": gene_record.get("gene_name", ""),
                    "description": gene_record.get("description", ""),
                    "phenotype_id": phenotype.get("phenotype_id", ""),
                    "phenotype_name": phenotype.get("phenotype_name", ""),
                    "phenotype_description": phenotype.get("phenotype_description", ""),
                    "mgi_id": gene_record.get("mgi_ids", [""])[0]
                    if gene_record.get("mgi_ids")
                    else "",
                    # Store lists as JSON strings
                    "alleles_json": json.dumps(gene_record.get("alleles", [])),
                    "pubmed_refs_json": json.dumps(gene_record.get("pubmed_refs", [])),
                    "genetic_backgrounds_json": json.dumps(
                        gene_record.get("genetic_backgrounds", [])
                    ),
                }

                documents.append(text)
                embeddings.append(embedding)
                metadatas.append(metadata)
                ids.append(f"doc_{doc_id}")

                doc_id += 1

                if doc_id % 100 == 0:
                    print(f"  📝 Processed {doc_id} gene-phenotype pairs...")

        # Add to ChromaDB in batch
        print(f"  💾 Adding {len(documents)} documents to ChromaDB...")
        collection.add(
            documents=documents, embeddings=embeddings, metadatas=metadatas, ids=ids
        )

        print(f"✅ Ingested {len(documents)} gene-phenotype pairs")
        print(f"  Total documents in collection: {collection.count()}")

        return len(documents)

    @timing_decorator
    def query(self, query_text: str, top_k: int = 15) -> Tuple[List[Dict], List[float]]:
        """
        Query the vector database

        Args:
            query_text: Natural language query
            top_k: Number of results to retrieve

        Returns:
            Tuple of (results, distances)
        """
        collection = self.client.get_collection(name=COLLECTION_NAME)

        # Generate query embedding
        query_embedding = self.embedding_model.encode(query_text).tolist()

        # Search ChromaDB
        results = collection.query(query_embeddings=[query_embedding], n_results=top_k)

        # Parse results
        metadatas = results["metadatas"][0] if results["metadatas"] else []
        distances = results["distances"][0] if results["distances"] else []

        # Convert distances to similarity scores (ChromaDB uses L2 distance)
        # Lower distance = higher similarity
        # Convert to 0-1 scale where 1 is most similar
        max_dist = max(distances) if distances else 1.0
        similarities = (
            [1.0 - (d / max_dist) for d in distances]
            if max_dist > 0
            else [1.0] * len(distances)
        )

        return metadatas, similarities

    def reset_collection(self):
        """Delete and recreate the collection"""
        try:
            self.client.delete_collection(name=COLLECTION_NAME)
            print(f"🗑️  Deleted existing collection '{COLLECTION_NAME}'")
        except Exception:
            pass

        return self.get_or_create_collection()


def build_vector_database():
    """
    Main function to build the vector database from processed data
    """
    print("\n" + "=" * 60)
    print("🚀 Building Vector Database for GeneVision RAG")
    print("=" * 60 + "\n")

    # Check if processed data exists
    if not PROCESSED_DATA_FILE.exists():
        print(f"❌ Error: Processed data file not found: {PROCESSED_DATA_FILE}")
        print("   Please run data processing first!")
        return

    # Load processed data
    print(f"📖 Loading processed data from {PROCESSED_DATA_FILE.name}...")
    with open(PROCESSED_DATA_FILE, "r", encoding="utf-8") as f:
        gene_data = json.load(f)

    print(f"✅ Loaded data for {len(gene_data)} genes")

    # Initialize vector store
    vector_store = VectorStore()

    # Reset collection if it exists
    vector_store.reset_collection()

    # Ingest data
    num_docs = vector_store.ingest_gene_data(gene_data)

    print("\n" + "=" * 60)
    print(f"✨ Vector database build complete!")
    print(f"  📊 Indexed {num_docs} gene-phenotype pairs")
    print(f"  📁 Saved to: {CHROMA_DB_PATH}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    build_vector_database()
