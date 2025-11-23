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

        // --- EMERGENCY MASTER KEY START ---
        // This block GUARANTEES you can log in, even if the database is empty or broken.
        if ("chamudithakarunarathna06@gmail.com".equalsIgnoreCase(email)) {
            System.out.println("✅ MASTER USER DETECTED. FORCE LOGGING IN...");

            List<GrantedAuthority> authorities = Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_ASSISTANT_REGISTRAR") // Set your desired role here
            );

            Map<String, Object> attributes = oAuth2User.getAttributes().entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            attributes.put("id", 999L);
            attributes.put("role", "ASSISTANT_REGISTRAR");
            attributes.put("name", "Chamuditha (Master)");

            return new DefaultOAuth2User(authorities, attributes, "email");
        }
        // --- EMERGENCY MASTER KEY END ---

        // Normal Database Check for everyone else
        AdminUser adminUser = adminUserRepository.findByEmail(email).orElse(null);

        if (adminUser == null) {
            System.out.println("❌ FAILURE: User not found in DB");
            throw new OAuth2AuthenticationException("Unauthorized");
        }

        String roleName = adminUser.getRole().name();
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + roleName)
        );

        Map<String, Object> attributes = oAuth2User.getAttributes().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        attributes.put("id", adminUser.getId());
        attributes.put("role", roleName);
        attributes.put("faculty", adminUser.getFaculty());
        attributes.put("name", adminUser.getName());

        return new DefaultOAuth2User(authorities, attributes, "email");
    }
}