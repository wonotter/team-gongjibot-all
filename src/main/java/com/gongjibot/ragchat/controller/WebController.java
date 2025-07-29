package com.gongjibot.ragchat.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController {
    
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        // React Router의 모든 경로를 index.html로 리다이렉트
        return "forward:/index.html";
    }
}
