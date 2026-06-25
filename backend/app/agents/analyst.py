from app.agents.state import PipelineState
from app.agents.retriever import create_event, parse_json_response
from app.core.llm import get_llm


async def analyst_node(state: PipelineState) -> dict:
    query = state.get("query", "")
    chunks = state.get("retrieved_chunks", [])

    events = [create_event("analyst", "running", "Synthesizing answer", 10)]

    try:
        llm = get_llm(temperature=0.2, json_mode=True)

        context = "\n\n".join(
            f"Source [{i + 1}] ({c['metadata'].get('source', 'Unknown')}): {c['content']}"
            for i, c in enumerate(chunks)
        )

        # On a revision pass the critic has already flagged problems. Feed that
        # feedback back in, otherwise the loop just regenerates the same answer.
        revision_block = ""
        critique = state.get("critique", "")
        previous = state.get("analysis", "")
        if critique and previous:
            revision_block = f"""
        This is a REVISION. Your previous answer was reviewed and found lacking.
        Previous answer:
        {previous}

        Reviewer feedback you MUST address:
        {critique}
        """

        prompt = f"""
        You are an analyst. Given the following context extracted from documents, answer the user's query.

        Context:
        {context}

        Query: {query}
        {revision_block}
        Instructions:
        1. Write a comprehensive analysis answering the query based ONLY on the context above.
        2. Cite your sources using [1], [2] notation corresponding to the source number.
        3. If the context does not contain the answer, say so plainly instead of guessing.
        4. Extract the key claims from your analysis into a list.

        Respond ONLY with a valid JSON object in this format:
        {{
            "analysis": "Your detailed answer with citations...",
            "claims": ["Claim 1", "Claim 2"]
        }}
        """

        events.append(create_event("analyst", "running", "Generating analysis", 50))

        response = await llm.ainvoke(prompt)

        try:
            parsed = parse_json_response(response.content)
            analysis = parsed.get("analysis", "")
            claims = parsed.get("claims", [])
        except Exception:
            # Fallback if json parsing fails
            analysis = response.content
            claims = ["Failed to extract structured claims."]

        events.append(
            create_event(
                "analyst",
                "complete",
                "Analysis complete",
                100,
                {"claims_extracted": len(claims)},
            )
        )

        return {"analysis": analysis, "claims": claims, "events": events}
    except Exception as e:
        events.append(create_event("analyst", "error", str(e), 100))
        return {"error": str(e), "events": events}
