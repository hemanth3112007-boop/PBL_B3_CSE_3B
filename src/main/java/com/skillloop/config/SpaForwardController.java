package com.skillloop.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/",
        "/skyline",
        "/portfolio",
        "/gap-engine",
        "/sheet-tracker",
        "/jd-matcher"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
