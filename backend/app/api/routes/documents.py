from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.core.database import get_db
from app.models.schemas import DocumentListResponse
from app.models.database import Document
from app.services.document_service import process_document
from app.services.vectorstore_service import vector_store_service

router = APIRouter()


@router.post("/upload", response_model=Document)
async def upload_document(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    file_bytes = await file.read()
    filename = file.filename
    file_type = file.content_type or "application/octet-stream"

    try:
        doc = await process_document(file_bytes, filename, file_type, db)
        return doc
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=DocumentListResponse)
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document))
    docs = result.scalars().all()
    return DocumentListResponse(documents=docs, total=len(docs))


@router.get("/{doc_id}", response_model=Document)
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from FAISS
    vector_store_service.delete_by_doc_id(doc_id)

    # Delete from DB
    await db.delete(doc)
    await db.commit()

    return {"status": "deleted"}


@router.get("/{doc_id}/chunks")
async def get_document_chunks(doc_id: str):
    return []
