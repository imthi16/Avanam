from app.agents.state import PipelineState
from app.agents.retriever import create_event, parse_json_response
from app.core.llm import get_llm


async def router_node(state: PipelineState) -> dict:
    query = state.get("query", "")

    events = [create_event("pipeline", "running", "Analyzing query intent", 5)]

    try:
        llm = get_llm(temperature=0.0, json_mode=True)

        prompt = f"""
        Analyze the following user query: "{query}"

        Determine if this query requires searching the document database to answer, or if it is a simple conversational greeting, pleasantry, or basic chat (e.g. "hi", "how are you", "who are you").

        Respond ONLY with a valid JSON object in this format:
        {{
            "intent": "chat",
            "simple_response": "Hello! I am Avanam, your document analysis AI. How can I help you today?"
        }}

        Use intent "search" for anything that asks about document content. Only include
        "simple_response" when intent is "chat".
        """

        response = await llm.ainvoke(prompt)

        try:
            parsed = parse_json_response(response.content)
            intent = parsed.get("intent", "search").lower()
            simple_response = parsed.get("simple_response", "")
        except Exception:
            intent = "search"
            simple_response = ""

        return {
            "intent": intent,
            "final_response": simple_response if intent == "chat" else None,
            "events": events,
        }
    except Exception as e:
        events.append(create_event("pipeline", "error", str(e), 10))
        return {"intent": "search", "events": events}  # Default to search on error
