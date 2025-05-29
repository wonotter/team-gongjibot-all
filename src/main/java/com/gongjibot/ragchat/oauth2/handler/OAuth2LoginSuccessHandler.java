package com.gongjibot.ragchat.oauth2.handler;

import com.gongjibot.ragchat.common.Role;
import com.gongjibot.ragchat.oauth2.CustomOAuth2User;
import com.gongjibot.ragchat.repository.UserRepository;
import com.gongjibot.ragchat.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final String FRONTEND_URL = "http://wonokim.iptime.org:3000";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        log.info("OAuth2 Login 성공!");

        try {
            CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

            // User의 Role이 GUEST일 경우 처음 요청한 회원이므로 회원가입 페이지로 리다이렉트
            if(oAuth2User.getRole() == Role.GUEST) {
                String accessToken = jwtService.createAccessToken(oAuth2User.getEmail());
                response.addHeader(jwtService.getAccessHeader(), "Bearer " + accessToken);
                
                // 토큰을 URL 파라미터로 전달
                String redirectUrl = FRONTEND_URL + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
                response.sendRedirect(redirectUrl);

                jwtService.sendAccessAndRefreshToken(response, accessToken, null);
            } else {
                // 로그인에 성공한 경우 access, refresh 토큰 생성
                String accessToken = jwtService.createAccessToken(oAuth2User.getEmail());
                String refreshToken = jwtService.createRefreshToken();
                
                response.addHeader(jwtService.getAccessHeader(), "Bearer " + accessToken);
                response.addHeader(jwtService.getRefreshHeader(), "Bearer " + refreshToken);

                // 토큰을 URL 파라미터로 전달
                String redirectUrl = FRONTEND_URL + 
                    "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8) + 
                    "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);
                
                jwtService.sendAccessAndRefreshToken(response, accessToken, refreshToken);
                jwtService.updateRefreshTokenOAuth2(oAuth2User.getEmail(), refreshToken);
                
                response.sendRedirect(redirectUrl);
            }
        } catch (Exception e) {
            log.error("OAuth2 로그인 처리 중 오류 발생: {}", e.getMessage());
            response.sendRedirect(FRONTEND_URL + "/login?error=true");
        }
    }
}
