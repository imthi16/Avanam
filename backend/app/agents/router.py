from app.agents.state import PipelineState
from app.agents.retriever import create_event
from app.core.llm import get_llm
import json

def router_node(state: PipelineState) -> dict:
    query = state.get("query", "")
    
    events = [create_event("pipeline", "running", "Analyzing query intent", 5)]
    
    try:
        llm = get_llm(temperature=0.0)
        
        prompt = f"""
        Analyze the following user query: "{query}"
        
        Determine if this query requires searching the document database to answer, or if it is a simple conversational greeting, pleasantry, or basic chat (e.g. "hi", "how are you", "who are you").
        
        Respond ONLY with a valid JSON object in this format:
        {{
            "intent": "chat", # or "search"
            "simple_response": "Hello! I am Avanam, your document analysis AI. How can I help you today?" # only if intent is 'chat'
        }}
        """
        
        response = llm.invoke(prompt)
        
        try:
            text = response.content.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(text)
            intent = parsed.get("intent", "search").lower()
            simple_response = parsed.get("simple_response", "")
        except Exception:
            intent = "search"
            simple_response = ""
            
        return {
            "intent": intent,
            "final_response": simple_response if intent == "chat" else None,
            "events": events
        }
    except Exception as e:
        events.append(create_event("pipeline", "error", str(e), 10))
        return {
            "intent": "search", # Default to search on error
            "events": events
        }
