package com.skillloop.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("SkillLoop AI - Backend REST APIs")
                        .version("1.0.0")
                        .description("Modular Spring Boot backend for Post-Training Employment Outcomes and Skill-Gap Analysis.\n\n" +
                                "Covers Trainee & Course Management (Harshit) and Longitudinal Follow-up, Verification, Skill-Gap Analysis, Recommendations & Analytics (Hemanth).")
                        .contact(new Contact().name("SkillLoop AI Team - Group B3").email("support@skillloop.ai"))
                        .license(new License().name("Educational / PBL 3rd Sem DSATM")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}

