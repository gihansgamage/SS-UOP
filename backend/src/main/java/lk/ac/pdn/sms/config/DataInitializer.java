package lk.ac.pdn.sms.config;

import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.entity.Society;
import lk.ac.pdn.sms.repository.AdminUserRepository;
import lk.ac.pdn.sms.repository.SocietyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(AdminUserRepository repo,
                                      PasswordEncoder encoder,
                                      SocietyRepository societyRepo) {
        return args -> {
            createTestUser(repo, encoder, "test_ar@sms.com", "Test AR", AdminUser.Role.ASSISTANT_REGISTRAR, null);
            createTestUser(repo, encoder, "test_vc@sms.com", "Test VC", AdminUser.Role.VICE_CHANCELLOR, null);
            createTestUser(repo, encoder, "test_dean@sms.com", "Test Dean", AdminUser.Role.DEAN, "Faculty of Science");

            if (societyRepo.count() == 0) {
                Society s = new Society();
                s.setSocietyName("Computer Society (Sample)");
                s.setStatus(Society.SocietyStatus.ACTIVE);
                s.setYear(2025);
                s.setRegisteredDate(LocalDate.now());
                societyRepo.save(s);
            }
        };
    }

    private void createTestUser(AdminUserRepository repo, PasswordEncoder encoder, String email, String name, AdminUser.Role role, String faculty) {
        if (!repo.existsByEmail(email)) {
            AdminUser user = new AdminUser();
            user.setEmail(email);
            user.setName(name);
            user.setRole(role);
            user.setFaculty(faculty);
            user.setPassword(encoder.encode("password123"));
            user.setIsActive(true);
            repo.save(user);
        }
    }
}