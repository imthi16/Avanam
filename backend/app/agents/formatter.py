from app.agents.state import PipelineState
from app.agents.retriever import create_event
from app.core.llm import get_llm
from app.config import get_settings

settings = get_settings()

def formatter_node(state: PipelineState) -> dict:
    analysis = state.get("analysis", "")
    critique = state.get("critique", "")
    chunks = state.get("retrieved_chunks", [])
    confidence_score = state.get("confidence_score", 0.0)
    
    events = [create_event("formatter", "running", "Structuring final output", 10)]
    
    try:
        llm = get_llm(temperature=0.2)
        
        prompt = f"""
        You are a formatter. Format the final response for the user based on the approved analysis.
        
        Analysis:
        {analysis}
        
        Critique Notes:
        {critique}
        
        Instructions:
        Provide a clean markdown response structured as follows:
        
        ### Executive Summary
        (2-3 sentences summarizing the answer)
        
        ### Detailed Analysis
        (The main analysis, ensuring inline citations like [1] or [2] are preserved)
        
        Do NOT add a "Sources" or "References" section at the end.
        Return ONLY the formatted markdown text.
        """
        
        events.append(create_event("formatter", "running", "Generating markdown", 50))
        
        response = llm.invoke(prompt)
        final_response = response.content.strip()
        
        citations = []
        for i, c in enumerate(chunks):
            citations.append({
                "index": i + 1,
                "source": c['metadata'].get('source', 'Unknown Document'),
                "content": c['content'][:200] + "..." # Truncate for frontend
            })
            
        events.append(create_event("formatter", "complete", "Formatting complete", 100))
        
        return {
            "final_response": final_response,
            "citations": citations,
            "events": events
        }
    except Exception as e:
        events.append(create_event("formatter", "error", str(e), 100))
        return {
            "error": str(e),
            "events": events
        }
