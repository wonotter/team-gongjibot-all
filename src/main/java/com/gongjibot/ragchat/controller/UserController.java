package com.gongjibot.ragchat.controller;

import com.gongjibot.ragchat.common.exception.BadRequestException;
import com.gongjibot.ragchat.common.exception.ErrorCode;
import com.gongjibot.ragchat.dto.*;
import com.gongjibot.ragchat.service.JwtService;
import com.gongjibot.ragchat.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/sign-up")
    public ResponseEntity<Void> signUp(@RequestBody @Valid SignUpRequestDto requestBody) {
        userService.singUp(requestBody);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email-certification")
    public ResponseEntity<Void> emailCertification(@RequestBody @Valid EmailCertificationRequestDto requestBody) {
        userService.emailCertification(requestBody);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/jwt-test")
    public String jwtTest() {
        return "jwtTest 요청 성공";
    }

    // @PostMapping("find-id")
    // public ResponseEntity<FindIdResponseDto> findId(@RequestBody @Valid FindIdRequestDto requestBody) {
    //     String username = userService.findId(requestBody);
    //     FindIdResponseDto responseDto = new FindIdResponseDto(username);
    //     return ResponseEntity.ok(responseDto);
    // }

    @PostMapping("/password-reset")
    public ResponseEntity<Void> passwordReset(@RequestBody @Valid PasswordResetDto requestBody) {
        userService.passwordReset(requestBody);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDto> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        // 토큰에서 사용자 이메일 추출
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token)
                .orElseThrow(() -> new BadRequestException(ErrorCode.USER_NOT_FOUND));
        
        // 사용자 정보 조회
        UserProfileResponseDto userProfile = userService.getUserProfileByEmail(email);
        
        return ResponseEntity.ok(userProfile);
    }
}
