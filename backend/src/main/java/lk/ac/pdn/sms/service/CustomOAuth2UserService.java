package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.repository.AdminUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AdminUserRepository adminUserRepository;

    public CustomOAuth2UserService(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");

        System.out.println("🚀 LOGIN ATTEMPT: " + email);

        // --- EMERGENCY MASTER KEYS (Hardcoded Access) ---

        if ("chamudithakarunarathna06@gmail.com".equalsIgnoreCase(email)) {
            return createMasterUser(oAuth2User, "ASSISTANT_REGISTRAR", 999L, "Chamuditha (AR)");
        }
        else if ("g.m.chamudithak@gmail.com".equalsIgnoreCase(email)) {
            // Deans usually need a Faculty. I set it to 'Science' for testing.
            return createMasterUserWithFaculty(oAuth2User, "DEAN", 998L, "Chamuditha (Dean)", "Faculty of Science");
        }
        else if ("gmckarunarathne@gmail.com".equalsIgnoreCase(email)) {
            return createMasterUser(oAuth2User, "VICE_CHANCELLOR", 997L, "Chamuditha (VC)");
        }
        // NEW: Student Service
        else if ("karunarathnagmc@gmail.com".equalsIgnoreCase(email)) {
            System.out.println("✅ MASTER USER (STUDENT SERVICE) DETECTED.");
            return createMasterUser(oAuth2User, "STUDENT_SERVICE", 996L, "Chamuditha (SS)");
        }
        // NEW: Test Dean Account (ADD THIS)
        else if ("test_dean@sms.com".equalsIgnoreCase(email)) {
            System.out.println("✅ MASTER USER (TEST DEAN) DETECTED.");
            return createMasterUserWithFaculty(oAuth2User, "DEAN", 888L, "Test Dean", "Faculty of Science");
        }
        // -------------------------------------------------

        // Normal Database Check (For real production users)
        AdminUser adminUser = adminUserRepository.findByEmail(email).orElse(null);

        if (adminUser == null) {
            System.out.println("❌ FAILURE: User not found in DB");
            throw new OAuth2AuthenticationException("Unauthorized");
        }

        if (!Boolean.TRUE.equals(adminUser.getIsActive())) {
            throw new OAuth2AuthenticationException("Inactive User");
        }

        String roleName = adminUser.getRole().name();
        return createOAuth2User(oAuth2User, roleName, adminUser.getId(), adminUser.getName(), adminUser.getFaculty());
    }

    // Helper to create Master User (No Faculty)
    private OAuth2User createMasterUser(OAuth2User oAuth2User, String role, Long id, String name) {
        return createMasterUserWithFaculty(oAuth2User, role, id, name, null);
    }

    // Helper to create Master User (With Faculty)
    private OAuth2User createMasterUserWithFaculty(OAuth2User oAuth2User, String role, Long id, String name, String faculty) {
        System.out.println("✅ MASTER USER (" + role + ") DETECTED. LOGGING IN...");
        return createOAuth2User(oAuth2User, role, id, name, faculty);
    }

    // Helper to build the Principal Object
    private OAuth2User createOAuth2User(OAuth2User oAuth2User, String role, Long id, String name, String faculty) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role)
        );
        Map<String, Object> attributes = oAuth2User.getAttributes().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        attributes.put("id", id);
        attributes.put("role", role);
        attributes.put("name", name);
        attributes.put("faculty", faculty);

        return new DefaultOAuth2User(authorities, attributes, "email");
    }
}