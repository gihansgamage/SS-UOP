package lk.ac.pdn.sms.config;

import lk.ac.pdn.sms.service.CustomOAuth2UserService;
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
import org.springframework.http.HttpMethod; // IMPORT THIS!

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Disable CSRF for public forms
                .authorizeHttpRequests(authz -> authz
                        // --- FIX STARTS HERE ---
                        // 1. Allow Society Registration (Public POST)
                        .requestMatchers(HttpMethod.POST, "/api/societies/register").permitAll()

                        // 2. Allow Event Permission Requests (Public POST)
                        .requestMatchers(HttpMethod.POST, "/api/events/request").permitAll()

                        // 3. Keep existing public GET endpoints
                        .requestMatchers(HttpMethod.GET, "/api/societies/public/**").permitAll()
                        .requestMatchers("/api/validation/**").permitAll()
                        // --- FIX ENDS HERE ---

                        // Role-based admin access
                        .requestMatchers("/api/admin/vc/**").hasRole("VICE_CHANCELLOR")
                        .requestMatchers("/api/admin/ar/**").hasRole("ASSISTANT_REGISTRAR")
                        .requestMatchers("/api/admin/dean/**").hasRole("DEAN")
                        .requestMatchers("/api/admin/ss/**").hasRole("STUDENT_SERVICE")
                        .requestMatchers("/api/admin/**").hasAnyRole("VICE_CHANCELLOR", "ASSISTANT_REGISTRAR", "DEAN", "STUDENT_SERVICE")

                        // Default: Everything else requires login
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oauth2AuthenticationSuccessHandler())
                        .failureHandler((request, response, exception) -> {
                            response.sendRedirect(frontendUrl + "/admin/login?error=auth_failed");
                        })
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.sendRedirect(frontendUrl + "/");
                        })
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            response.sendRedirect(frontendUrl + "/admin");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}