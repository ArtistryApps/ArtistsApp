"""Music controller for business logic."""
from typing import List, Dict, Any, Optional
from ..ports import IMusicAnalysisPort, IMusicRepositoryPort


class MusicController:
    """Controller for music operations."""

    def __init__(self, analysis_port: IMusicAnalysisPort, repository_port: IMusicRepositoryPort):
        self.analysis_port = analysis_port
        self.repository_port = repository_port

    def process_song_analysis(self, song_data: Dict[str, Any], beats: List[Dict[str, Any]]) -> Dict[str, Any]:
        song_id = self.repository_port.save_song(song_data)

        beats_with_sections = self.analysis_port.identify_sections(beats)
        section_analysis = self.analysis_port.analyze_chords(beats_with_sections)

        for beat in beats_with_sections:
            if beat.get("chord"):
                beat["chord_degree"] = self.analysis_port.chord_to_degree(
                    beat["chord"],
                    song_data.get("key", "C"),
                )
                beat["chord_quality"] = self.analysis_port.chord_to_quality(beat["chord"])

        self.repository_port.save_beats(song_id, beats_with_sections)
        self.repository_port.save_sections(song_id, section_analysis)

        return {
            "song_id": song_id,
            "beats": beats_with_sections,
            "sections": section_analysis,
        }

    def get_song_analysis(self, song_id: int) -> Dict[str, Any]:
        song = self.repository_port.get_song(song_id)
        if not song:
            return {}

        beats = self.repository_port.get_beats(song_id)
        sections = self.repository_port.get_sections(song_id)

        return {
            "song": song,
            "beats": beats,
            "sections": sections,
        }
