from app.agents.state import PipelineState
from app.agents.retriever import create_event
from app.core.llm import get_llm
from app.config import get_settings
import json

settings = get_settings()

def critic_node(state: PipelineState) -> dict:
    analysis = state.get("analysis", "")
    claims = state.get("claims", [])
    chunks = state.get("retrieved_chunks", [])
    revision_count = state.get("revision_count", 0)
    
    events = [create_event("critic", "running", "Fact-checking claims", 10)]
    
    try:
        llm = get_llm(temperature=0.1)
        
        context = "\n\n".join([f"Source [{i+1}]: {c['content']}" for i, c in enumerate(chunks)])
        
        prompt = f"""
        You are a harsh critic. Fact-check the following claims against the provided source context.
        
        Context:
        {context}
        
        Analysis to review:
        {analysis}
        
        Claims:
        {json.dumps(claims)}
        
        Instructions:
        1. Verify if each claim is supported by the context.
        2. Score the overall confidence of the analysis from 0.0 to 1.0.
        3. Provide a critique.
        
        Respond ONLY with a valid JSON object in this format:
        {{
            "confidence_score": 0.85,
            "critique": "Your detailed critique here..."
        }}
        """
        
        events.append(create_event("critic", "running", "Scoring confidence", 50))
        
        response = llm.invoke(prompt)
        
        try:
            text = response.content.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(text)
            confidence_score = float(parsed.get("confidence_score", 0.0))
            critique = parsed.get("critique", "")
        except Exception:
            confidence_score = 0.5
            critique = "Failed to parse critique."
            
        needs_revision = False
        if confidence_score < settings.CRITIC_CONFIDENCE_THRESHOLD and revision_count < settings.MAX_REVISION_LOOPS:
            needs_revision = True
            events.append(create_event("critic", "revision", "Triggering revision", 100, {
                "confidence_score": confidence_score,
                "reason": critique
            }))
        else:
            events.append(create_event("critic", "complete", "Critique complete", 100, {
                "confidence_score": confidence_score
            }))
            
        return {
            "critique": critique,
            "confidence_score": confidence_score,
            "needs_revision": needs_revision,
            "revision_count": revision_count + 1 if needs_revision else revision_count,
            "events": events
        }
    except Exception as e:
        events.append(create_event("critic", "error", str(e), 100))
        return {
            "error": str(e),
            "events": events
        }
