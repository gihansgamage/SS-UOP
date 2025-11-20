package lk.ac.pdn.sms.config;

import lk.ac.pdn.sms.service.CustomOAuth2UserService; // NEW IMPORT
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // FIX: Inject the custom user service
    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // Public access for applicant forms and validation
                        .requestMatchers("/api/public/**", "/api/validation/**").permitAll()
                        // Role-based admin access (ROLE_ is prepended by Spring, we use the Enum names)
                        .requestMatchers("/api/admin/vc/**").hasRole("VICE_CHANCELLOR")
                        .requestMatchers("/api/admin/ar/**").hasRole("ASSISTANT_REGISTRAR")
                        .requestMatchers("/api/admin/dean/**").hasRole("DEAN")
                        .requestMatchers("/api/admin/ss/**").hasRole("STUDENT_SERVICE")
                        .requestMatchers("/api/admin/**").hasAnyRole("VICE_CHANCELLOR", "ASSISTANT_REGISTRAR", "DEAN", "STUDENT_SERVICE")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        // FIX: Use custom user service to validate/load AdminUser
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        // FIX: Configure custom success/failure handlers to redirect to frontend admin panel
                        .successHandler(oauth2AuthenticationSuccessHandler())
                        .failureHandler((request, response, exception) -> {
                            // Redirect to login page with error message on failure
                            response.sendRedirect(frontendUrl + "/adminlogin?error=auth_failed");
                        })
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            // Redirect to frontend home page after logout
                            response.sendRedirect(frontendUrl + "/");
                        })
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            // On successful login, redirect to the frontend admin panel
            response.sendRedirect(frontendUrl + "/admin/dashboard");
        };
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all configured origins including dynamic FE URL and common dev origins
        configuration.setAllowedOriginPatterns(Arrays.asList(frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}