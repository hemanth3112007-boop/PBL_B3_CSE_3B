package com.skillloop.auth;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin User Provisioning", description = "Authorized user provisioning and role assignment for staff and administrators")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AdminUserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @Operation(summary = "Provision a new staff, admin, or employer account (ADMIN only)")
    public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> provisionUser(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        AuthDtos.AuthResponse response = authService.provisionUserByAdmin(request, request.getRole());
        return ResponseEntity.ok(ApiResponse.ok("User account provisioned successfully", response));
    }

    @GetMapping
    @Operation(summary = "List all user accounts in the system (ADMIN only)")
    public ResponseEntity<ApiResponse<List<AuthDtos.UserSummary>>> listAllUsers() {
        List<AuthDtos.UserSummary> users = userRepository.findAll().stream()
                .map(AuthDtos.UserSummary::new)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }
}
