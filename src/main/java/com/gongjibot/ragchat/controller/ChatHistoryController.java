package com.gongjibot.ragchat.controller;

import com.gongjibot.ragchat.dto.ChatHistoryResponseDto;
import com.gongjibot.ragchat.entity.ChatQuestion;
import com.gongjibot.ragchat.entity.User;
import com.gongjibot.ragchat.repository.ChatQuestionRepository;
import com.gongjibot.ragchat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
@Slf4j
public class ChatHistoryController {

    private final ChatQuestionRepository chatQuestionRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ChatHistoryResponseDto> getChatHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        // 현재 로그인한 사용자 정보 가져오기
        User user = userService.getUserByEmail(userDetails.getUsername());

        // 사용자의 채팅 내역 조회
        List<ChatQuestion> chatQuestions = chatQuestionRepository.findByUserOrderByCreatedAtDesc(user);

        // DTO로 변환
        List<ChatHistoryResponseDto.ChatEntry> chatEntries = chatQuestions.stream()
                .map(q -> new ChatHistoryResponseDto.ChatEntry(q.getQuestion(), q.getAnswer(), q.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ChatHistoryResponseDto(chatEntries));
    }


}
