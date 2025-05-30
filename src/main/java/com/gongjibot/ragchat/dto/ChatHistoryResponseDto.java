package com.gongjibot.ragchat.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ChatHistoryResponseDto(List<ChatEntry> history) {
    public record ChatEntry(String question, String answer, LocalDateTime timestamp) {
    }
}
