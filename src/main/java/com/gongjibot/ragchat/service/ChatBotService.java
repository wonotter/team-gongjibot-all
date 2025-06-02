package com.gongjibot.ragchat.service;

import com.gongjibot.ragchat.dto.ChatRequestDto;
import com.gongjibot.ragchat.dto.ChatResponseDto;
import com.gongjibot.ragchat.entity.ChatQuestion;
import com.gongjibot.ragchat.entity.User;
import com.gongjibot.ragchat.repository.ChatQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatBotService {

    private final ChatQuestionRepository chatQuestionRepository;
    private final RestTemplate restTemplate;

    @Value("${fastapi.url}")
    private String fastApiUrl;
    
    // 테스트 모드 설정 (application.yml에 추가할 수 있음)
    @Value("${chatbot.test-mode:true}")
    private boolean testMode;

    @Transactional
    public ChatResponseDto processQuestion(User user, ChatRequestDto requestDto) {
        String question = requestDto.question();

        // FastAPI에 질문 전송 또는 테스트 모드일 경우 모의 응답 생성
        String answer = sendQuestionToFastApi(question);

        // DB에 질문과 답변 저장
        ChatQuestion chatQuestion = ChatQuestion.builder()
                .user(user)
                .question(question)
                .answer(answer)
                .build();

        chatQuestionRepository.save(chatQuestion);

        return ChatResponseDto.of(answer);
    }

    private String sendQuestionToFastApi(String question) {
        // 테스트 모드이면 모의 응답 반환
        if (testMode) {
            log.info("테스트 모드: 질문 = {}", question);
            return generateMockResponse(question);
        }
        
        // 실제 FastAPI 연결 로직
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", question);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // FastAPI 엔드포인트로 요청
            Map<String, String> response = restTemplate.postForObject(
                    fastApiUrl + "/ask",
                    entity,
                    Map.class
            );
            
            log.info("FastAPI 응답: {}", response);

            if (response != null) {
                // 가능한 응답 키 확인
                if (response.containsKey("answer")) {
                    return response.get("answer");
                } else if (response.containsKey("response")) {
                    return response.get("response");
                } else if (response.containsKey("result")) {
                    return response.get("result");
                } else {
                    log.warn("알 수 없는 응답 형식: {}", response);
                    return "응답 형식이 예상과 다릅니다.";
                }
            } else {
                return "답변을 받아오는 데 실패했습니다.";
            }
        } catch (Exception e) {
            log.error("FastAPI 통신 중 오류 발생: {}", e.getMessage());
            return "AI 서버와 통신 중 오류가 발생했습니다.";
        }
    }
    
    /**
     * 모의 응답을 생성하는 메서드
     */
    private String generateMockResponse(String question) {
        // 간단한 키워드 기반 응답 생성
        if (question.contains("안녕") || question.contains("hello")) {
            return "안녕하세요! 무엇을 도와드릴까요?";
        } else if (question.contains("날씨")) {
            return "오늘은 맑은 날씨가 예상됩니다. 최고 기온은 25도, 최저 기온은 15도입니다.";
        } else if (question.contains("시간") || question.contains("몇 시")) {
            return "현재 시간은 서버 기준으로 " + java.time.LocalTime.now().toString() + " 입니다.";
        } else if (question.contains("감사") || question.contains("고마")) {
            return "천만에요! 더 필요한 것이 있으면 언제든지 물어보세요.";
        } else {
            return "'" + question + "'에 대한 답변을 준비 중입니다. 이것은 테스트 모드에서의 자동 응답입니다.";
        }
    }
}
