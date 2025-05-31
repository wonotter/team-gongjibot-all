package com.gongjibot.ragchat.dto;

import com.gongjibot.ragchat.entity.User;
import java.time.LocalDateTime;

public record UserProfileResponseDto(
    Long id,
    String email,
    String nickname,
    String imageUrl,
    String socialType,
    LocalDateTime createDate,
    String role
) {
    public static UserProfileResponseDto fromEntity(User user) {
        return new UserProfileResponseDto(
            user.getId(),
            user.getEmail(),
            user.getNickname(),
            user.getImageUrl(),
            user.getSocialType() != null ? user.getSocialType().name() : null,
            user.getCreateDate(),
            user.getRole().name()
        );
    }
} 