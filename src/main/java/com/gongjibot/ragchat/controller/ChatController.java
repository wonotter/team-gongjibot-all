package com.gongjibot.ragchat.controller;

import com.gongjibot.ragchat.dto.ChatRequestDto;
import com.gongjibot.ragchat.dto.ChatResponseDto;
import com.gongjibot.ragchat.entity.User;
import com.gongjibot.ragchat.service.ChatBotService;
import com.gongjibot.ragchat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatBotService chatBotService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ChatResponseDto> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChatRequestDto requestDto) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        // 현재 로그인한 사용자 정보 가져오기
        User user = userService.getUserByEmail(userDetails.getUsername());

        // 질문 처리 및 응답
        ChatResponseDto responseDto = chatBotService.processQuestion(user, requestDto);

        return ResponseEntity.ok(responseDto);
    }
}
