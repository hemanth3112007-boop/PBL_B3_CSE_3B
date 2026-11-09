package com.skillloop.training;

import com.skillloop.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certifications")
@Tag(name = "Certifications & Credential Verification", description = "Certificate issuance, policy evaluation, controlled revocation, and public verification")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @GetMapping("/verify/{certificateNumber}")
    @Operation(summary = "Public minimal credential verification (Privacy-preserving, unauthenticated)")
    public ResponseEntity<ApiResponse<TrainingDtos.PublicCertificateVerificationResponse>> verifyCertificate(
            @PathVariable String certificateNumber) {
        TrainingDtos.PublicCertificateVerificationResponse response = certificationService.verifyCertificatePublic(certificateNumber);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @Operation(summary = "Issue certification upon meeting configurable academic eligibility (STAFF or ADMIN only)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTITUTE_STAFF')")
    public ResponseEntity<ApiResponse<Certification>> issueCertificate(
            @Valid @RequestBody TrainingDtos.IssueCertificationRequest request) {
        Certification cert = certificationService.issueCertificate(request);
        return ResponseEntity.ok(ApiResponse.ok("Certificate issued successfully", cert));
    }

    @RequestMapping(value = "/{id}/revoke", method = {RequestMethod.PUT, RequestMethod.POST})
    @Operation(summary = "Controlled certificate revocation with mandatory audit justification (ADMIN only, supports PUT or POST)")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Certification>> revokeCertificate(
            @PathVariable Long id,
            @Valid @RequestBody TrainingDtos.RevokeCertificateRequest request,
            Authentication authentication) {
        String adminUsername = (authentication != null) ? authentication.getName() : "ADMIN";
        Certification revoked = certificationService.revokeCertificate(id, request, adminUsername);
        return ResponseEntity.ok(ApiResponse.ok("Certificate successfully revoked", revoked));
    }

    @GetMapping("/enrollment/{enrollmentId}")
    @Operation(summary = "Get certificate by enrollment ID (STAFF/ADMIN or Owner Trainee)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Certification>> getByEnrollment(
            @PathVariable Long enrollmentId,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.getCertificateByEnrollment(enrollmentId, authentication)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get certificate details by certificate ID (STAFF/ADMIN or Owner Trainee)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Certification>> getById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.getCertificateById(id, authentication)));
    }
}
