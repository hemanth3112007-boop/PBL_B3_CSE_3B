package com.skillloop.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springdoc.webmvc.api.OpenApiWebMvcResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@RestController
public class OpenApiHtmlViewerController {

    private final OpenApiWebMvcResource openApiWebMvcResource;

    public OpenApiHtmlViewerController(OpenApiWebMvcResource openApiWebMvcResource) {
        this.openApiWebMvcResource = openApiWebMvcResource;
    }

    /**
     * When requested in a web browser (Accept: text/html), render the OpenAPI JSON
     * in a high-contrast viewer with solid black text (#000000) on a clean white background.
     */
    @GetMapping(value = "/api-docs", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getApiDocsAsHtml(HttpServletRequest request, Locale locale) throws Exception {
        byte[] jsonBytes = openApiWebMvcResource.openapiJson(request, "/api-docs", locale);
        String jsonString = new String(jsonBytes, StandardCharsets.UTF_8);

        // Escape HTML entities to prevent rendering issues
        String escapedJson = jsonString
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");

        String html = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SkillLoop AI — OpenAPI JSON Documentation</title>
                    <style>
                        * {
                            box-sizing: border-box;
                        }
                        html, body {
                            margin: 0;
                            padding: 0;
                            background-color: #ffffff !important;
                            color: #000000 !important;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        }
                        .container {
                            max-width: 1200px;
                            margin: 0 auto;
                            padding: 24px;
                        }
                        .header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            gap: 12px;
                            margin-bottom: 20px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #e5e7eb;
                        }
                        .title-group h1 {
                            margin: 0 0 4px 0;
                            font-size: 22px;
                            font-weight: 700;
                            color: #000000 !important;
                        }
                        .title-group p {
                            margin: 0;
                            font-size: 14px;
                            color: #374151 !important;
                        }
                        .actions {
                            display: flex;
                            gap: 10px;
                        }
                        .btn {
                            display: inline-flex;
                            align-items: center;
                            padding: 8px 16px;
                            font-size: 14px;
                            font-weight: 600;
                            border-radius: 6px;
                            text-decoration: none;
                            cursor: pointer;
                            transition: all 0.15s ease-in-out;
                        }
                        .btn-primary {
                            background-color: #000000;
                            color: #ffffff !important;
                            border: 1px solid #000000;
                        }
                        .btn-primary:hover {
                            background-color: #1f2937;
                        }
                        .btn-secondary {
                            background-color: #ffffff;
                            color: #000000 !important;
                            border: 1px solid #d1d5db;
                        }
                        .btn-secondary:hover {
                            background-color: #f3f4f6;
                        }
                        pre#json-content {
                            margin: 0;
                            background-color: #ffffff !important;
                            color: #000000 !important;
                            border: 1px solid #d1d5db;
                            border-radius: 8px;
                            padding: 20px;
                            font-family: "Cascadia Code", "Fira Code", Consolas, Monaco, "Courier New", monospace;
                            font-size: 13.5px;
                            line-height: 1.6;
                            white-space: pre-wrap;
                            word-break: break-word;
                            tab-size: 2;
                        }
                        pre#json-content * {
                            color: #000000 !important;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="title-group">
                                <h1>SkillLoop AI — OpenAPI JSON Specification</h1>
                                <p>Rendered with pure black text for readability. Use the button to copy raw JSON or open interactive Swagger UI.</p>
                            </div>
                            <div class="actions">
                                <button class="btn btn-primary" id="copy-btn" onclick="copyJson()">Copy Raw JSON</button>
                                <a href="/swagger-ui.html" class="btn btn-secondary" target="_blank">Open Swagger UI ↗</a>
                            </div>
                        </div>
                        <pre id="json-content">""" + escapedJson + """
                        </pre>
                    </div>
                    <script>
                        function copyJson() {
                            const btn = document.getElementById('copy-btn');
                            const text = document.getElementById('json-content').innerText;
                            navigator.clipboard.writeText(text).then(() => {
                                btn.innerText = 'Copied to Clipboard!';
                                setTimeout(() => btn.innerText = 'Copy Raw JSON', 2500);
                            });
                        }
                    </script>
                </body>
                </html>
                """;

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    /**
     * Explicit controller endpoint serving the custom black-text CSS for Swagger UI.
     */
    @GetMapping(value = "/swagger-ui-custom.css", produces = "text/css")
    public ResponseEntity<String> getSwaggerUiCustomCss() {
        try {
            ClassPathResource res = new ClassPathResource("static/swagger-ui-custom.css");
            try (InputStream in = res.getInputStream()) {
                String css = new String(in.readAllBytes(), StandardCharsets.UTF_8);
                return ResponseEntity.ok().contentType(MediaType.parseMediaType("text/css")).body(css);
            }
        } catch (Exception e) {
            String fallbackCss = "body, .swagger-ui, .swagger-ui * { color: #000000 !important; }";
            return ResponseEntity.ok().contentType(MediaType.parseMediaType("text/css")).body(fallbackCss);
        }
    }
}
