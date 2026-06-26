"""Unit tests for pipeline telemetry helpers."""

from app.agents.pipeline import agent_durations_ms


def _evt(agent, ts):
    return {"agent": agent, "timestamp": ts, "status": "running"}


class TestAgentDurations:
    def test_empty(self):
        assert agent_durations_ms([]) == {}

    def test_single_agent_span(self):
        events = [
            _evt("analyst", "2026-06-26T12:00:00.000000Z"),
            _evt("analyst", "2026-06-26T12:00:00.500000Z"),
        ]
        result = agent_durations_ms(events)
        assert result["analyst"] == 500.0

    def test_multiple_agents_tracked_independently(self):
        events = [
            _evt("retriever", "2026-06-26T12:00:00.000000Z"),
            _evt("retriever", "2026-06-26T12:00:00.200000Z"),
            _evt("analyst", "2026-06-26T12:00:01.000000Z"),
            _evt("analyst", "2026-06-26T12:00:03.000000Z"),
        ]
        result = agent_durations_ms(events)
        assert result["retriever"] == 200.0
        assert result["analyst"] == 2000.0

    def test_ignores_malformed_or_incomplete_events(self):
        events = [
            _evt("analyst", "not-a-timestamp"),
            {"timestamp": "2026-06-26T12:00:00.000000Z"},  # no agent
            {"agent": "critic"},  # no timestamp
        ]
        assert agent_durations_ms(events) == {}
