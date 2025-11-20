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

        // 1. Check if user exists in the admin_users table and is active
        AdminUser adminUser = adminUserRepository.findByEmail(email)
                .orElse(null);

        if (adminUser == null || !adminUser.getIsActive()) {
            // Throwing an exception prevents login for unauthorized/inactive users
            throw new OAuth2AuthenticationException("Unauthorized or Inactive Admin User: " + email);
        }

        // 2. Map custom role to Spring Security Authority
        String roleName = adminUser.getRole().name();
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + roleName) // e.g., ROLE_DEAN
        );

        // 3. Create a custom principal with added attributes for authorization logic
        Map<String, Object> attributes = oAuth2User.getAttributes().entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue
                ));

        attributes.put("id", adminUser.getId());
        attributes.put("role", roleName);
        attributes.put("faculty", adminUser.getFaculty()); // Used for Dean filtering
        attributes.put("name", adminUser.getName());

        return new DefaultOAuth2User(
                authorities,
                attributes,
                "email"
        );
    }
}