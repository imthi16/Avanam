"""Unit tests for the RAG retrieval/scoring building blocks.

These cover the pure logic that powers retrieval quality and do not require
Ollama, Postgres, or Redis to be running.
"""

import pytest

from app.services.vectorstore_service import l2_squared_to_cosine
from app.services.document_service import chunk_text
from app.agents.retriever import parse_json_response


class TestL2ToCosine:
    def test_identical_vectors_score_one(self):
        # squared-L2 distance of 0 => perfectly similar
        assert l2_squared_to_cosine(0.0) == 1.0

    def test_orthogonal_vectors_score_half(self):
        # cos = 1 - score/2; score=1 => 0.5
        assert l2_squared_to_cosine(1.0) == pytest.approx(0.5)

    def test_opposite_vectors_score_zero(self):
        # score=2 => cos 0; score=4 (max) clamps to 0
        assert l2_squared_to_cosine(2.0) == 0.0
        assert l2_squared_to_cosine(4.0) == 0.0

    def test_scores_are_clamped_to_unit_interval(self):
        for raw in (-1.0, 0.0, 0.5, 2.0, 10.0):
            assert 0.0 <= l2_squared_to_cosine(raw) <= 1.0

    def test_monotonic_decreasing_in_distance(self):
        assert l2_squared_to_cosine(0.2) > l2_squared_to_cosine(0.8)


class TestChunking:
    def test_long_text_splits_into_multiple_chunks(self):
        text = "word " * 2000
        chunks = chunk_text(text, chunk_size=200, chunk_overlap=20)
        assert len(chunks) > 1
        assert all(len(c) <= 200 for c in chunks)

    def test_short_text_is_single_chunk(self):
        chunks = chunk_text("a short sentence", chunk_size=500, chunk_overlap=50)
        assert chunks == ["a short sentence"]


class TestParseJsonResponse:
    def test_plain_json(self):
        assert parse_json_response('{"intent": "search"}') == {"intent": "search"}

    def test_json_wrapped_in_markdown_fence(self):
        raw = '```json\n{"confidence_score": 0.9}\n```'
        assert parse_json_response(raw) == {"confidence_score": 0.9}

    def test_invalid_json_raises(self):
        with pytest.raises(ValueError):
            parse_json_response("not json at all")
