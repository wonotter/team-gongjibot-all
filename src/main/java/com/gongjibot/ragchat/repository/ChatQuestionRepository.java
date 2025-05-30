package com.gongjibot.ragchat.repository;

import com.gongjibot.ragchat.entity.ChatQuestion;
import com.gongjibot.ragchat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatQuestionRepository extends JpaRepository<ChatQuestion, Long> {
    List<ChatQuestion> findByUserOrderByCreatedAtDesc(User user);
}
