"""
Vector database module using ChromaDB for semantic search
"""

import time
import json
import psutil
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

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
        
        # Check available RAM
        self._check_system_resources()

        # Initialize ChromaDB client with persistence
        self.client = chromadb.PersistentClient(
            path=str(persist_directory),
            settings=Settings(anonymized_telemetry=False, allow_reset=True),
        )

        # Load embedding model
        print(f"  ⏳ Loading embedding model...")
        self.embedding_model = SentenceTransformer(embedding_model)
        print(f"  ✅ Model loaded: {embedding_model}")
        
        # Check RAM after loading model
        self._check_system_resources()

    def _check_system_resources(self):
        """Check available system RAM"""
        memory = psutil.virtual_memory()
        total_gb = memory.total / (1024**3)
        available_gb = memory.available / (1024**3)
        used_percent = memory.percent
        
        print(f"  💾 RAM Status: {available_gb:.1f}GB available / {total_gb:.1f}GB total ({used_percent:.1f}% used)")
        
        if available_gb < 2.0:
            print(f"  ⚠️  WARNING: Low RAM available ({available_gb:.1f}GB). Consider closing other applications.")
        elif available_gb < 4.0:
            print(f"  ⚡ RAM OK but limited ({available_gb:.1f}GB). Using smaller batches is recommended.")
        else:
            print(f"  ✅ RAM looks good ({available_gb:.1f}GB available)")
        
        return available_gb

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
    def ingest_gene_data(self, gene_data: Dict[str, Dict], batch_size: int = 100, resume_from: int = 0):
        """
        Ingest gene-phenotype data into ChromaDB with batch processing

        Creates one embedding per gene-phenotype pair for granular matching
        Uses batch processing for efficient embedding generation
        Supports resuming from a specific document index

        Args:
            gene_data: Dictionary of gene data keyed by gene_symbol
            batch_size: Number of embeddings to generate and add per batch
            resume_from: Document index to resume from (default: 0)
        """
        collection = self.get_or_create_collection()

        print(f"\n🔄 Ingesting gene-phenotype data with batch processing...")
        print(f"  📦 Batch size: {batch_size}")
        if resume_from > 0:
            print(f"  ⏩ Resuming from document {resume_from:,}")

        all_documents = []
        all_metadatas = []
        all_texts = []

        # First, collect all texts and metadatas with progress bar
        print(f"\n📝 Step 1/2: Preparing documents...")
        gene_items = list(gene_data.items())
        
        # Calculate total phenotypes for accurate progress
        total_phenotypes = sum(len(g.get("phenotypes", [])) for g in gene_data.values())
        print(f"   Total phenotypes to process: {total_phenotypes:,}")
        
        with tqdm(total=total_phenotypes, desc="Preparing documents", unit="docs", ncols=100, colour='cyan') as pbar:
            for gene_idx, (gene_sym, gene_record) in enumerate(gene_items, 1):
                phenotypes = gene_record.get("phenotypes", [])
                num_phenotypes = len(phenotypes)
                
                # Show which gene we're processing if it has many phenotypes
                if num_phenotypes > 1000:
                    pbar.set_description(f"Processing {gene_sym} ({num_phenotypes:,} phenotypes)")
                else:
                    pbar.set_description("Preparing documents")

                for phenotype in phenotypes:
                    # Create embedding text
                    text = self.create_embedding_text(gene_record, phenotype)

                    if not text:
                        pbar.update(1)
                        continue

                    # Create metadata (must be simple types for ChromaDB)
                    metadata = {
                        "gene_symbol": gene_sym,
                        "gene_name": gene_record.get("gene_name", ""),
                        "description": gene_record.get("description", ""),
                        "is_curated": gene_record.get("is_curated", False),
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

                    all_texts.append(text)
                    all_documents.append(text)
                    all_metadatas.append(metadata)
                    
                    # Update progress bar for each phenotype
                    pbar.update(1)
                    
                    # Update postfix every 1000 documents
                    if len(all_documents) % 1000 == 0:
                        pbar.set_postfix({'genes': f'{gene_idx}/{len(gene_items)}', 'docs': f'{len(all_documents):,}'})

        total_docs = len(all_documents)
        print(f"✅ Prepared {total_docs:,} documents (gene-phenotype pairs)")

        # Check current count in database
        current_count = collection.count()
        if current_count > 0:
            print(f"\n⚠️  Found {current_count:,} existing documents in collection")
            print(f"   Total to process: {total_docs:,}")
            
            if current_count >= total_docs:
                print("   ✅ Database already fully populated!")
                return total_docs

        # Determine start position
        start_idx = max(resume_from, current_count)
        if start_idx > 0:
            print(f"   ⏩ Skipping first {start_idx:,} documents (already processed)")

        # Process in batches with progress bar
        print(f"\n🔧 Step 2/2: Generating embeddings and building vector database...")
        print(f"   Processing {total_docs - start_idx:,} documents starting from index {start_idx:,}")
        
        num_batches = ((total_docs - start_idx) + batch_size - 1) // batch_size
        
        with tqdm(total=total_docs - start_idx, desc="Vectorizing & indexing", unit="docs", ncols=100, colour='green') as pbar:
            for batch_start in range(start_idx, total_docs, batch_size):
                batch_end = min(batch_start + batch_size, total_docs)
                batch_texts = all_texts[batch_start:batch_end]
                batch_documents = all_documents[batch_start:batch_end]
                batch_metadatas = all_metadatas[batch_start:batch_end]

                # Generate embeddings for batch
                batch_embeddings = self.embedding_model.encode(
                    batch_texts, 
                    show_progress_bar=False,
                    batch_size=32
                ).tolist()

                # Create IDs for batch
                batch_ids = [f"doc_{i}" for i in range(batch_start, batch_end)]

                # Add batch to ChromaDB
                try:
                    collection.add(
                        documents=batch_documents,
                        embeddings=batch_embeddings,
                        metadatas=batch_metadatas,
                        ids=batch_ids
                    )
                except Exception as e:
                    print(f"\n❌ Error adding batch {batch_start}-{batch_end}: {e}")
                    print(f"   You can resume from document {batch_start} by restarting")
                    raise

                # Update progress bar
                pbar.update(batch_end - batch_start)
                
                # Show current stats with RAM usage
                current_batch = (batch_start - start_idx) // batch_size + 1
                
                # Check RAM every 10 batches
                if current_batch % 10 == 0:
                    memory = psutil.virtual_memory()
                    ram_gb = memory.available / (1024**3)
                    pbar.set_postfix({
                        'batch': f'{current_batch}/{num_batches}',
                        'docs': f'{batch_end:,}/{total_docs:,}',
                        'RAM': f'{ram_gb:.1f}GB'
                    })
                else:
                    pbar.set_postfix({
                        'batch': f'{current_batch}/{num_batches}',
                        'docs': f'{batch_end:,}/{total_docs:,}'
                    })

        final_count = collection.count()
        print(f"\n✅ Successfully ingested all documents!")
        print(f"  📊 Total documents in collection: {final_count:,}")
        print(f"  🧬 Covering {len(gene_data):,} genes")

        return total_docs

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


def build_vector_database(batch_size: int = 100):
    """
    Main function to build the vector database from processed data

    Args:
        batch_size: Number of embeddings to generate per batch
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

    print(f"✅ Loaded data for {len(gene_data):,} genes")

    # Calculate total phenotypes
    total_phenotypes = sum(len(g.get("phenotypes", [])) for g in gene_data.values())
    print(f"  📊 Total gene-phenotype pairs: {total_phenotypes:,}")

    # Initialize vector store
    vector_store = VectorStore()

    # Reset collection if it exists
    vector_store.reset_collection()

    # Ingest data with batch processing
    num_docs = vector_store.ingest_gene_data(gene_data, batch_size=batch_size)

    print("\n" + "=" * 60)
    print(f"✨ Vector database build complete!")
    print(f"  📊 Indexed {num_docs:,} gene-phenotype pairs")
    print(f"  🧬 Covering {len(gene_data):,} genes")
    print(f"  📁 Saved to: {CHROMA_DB_PATH}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    build_vector_database()
