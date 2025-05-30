package com.gongjibot.ragchat.dto;

public record ChatResponseDto(String answer) {
    public static ChatResponseDto of(String answer) {
        return new ChatResponseDto(answer);
    }
}
