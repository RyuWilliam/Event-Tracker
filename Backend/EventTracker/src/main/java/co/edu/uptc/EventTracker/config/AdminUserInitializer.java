package co.edu.uptc.EventTracker.config;

import co.edu.uptc.EventTracker.persistence.crud.UserJpaRepository;
import co.edu.uptc.EventTracker.persistence.entities.UserEntity;
import co.edu.uptc.EventTracker.persistence.enums.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserJpaRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name:Admin}")
    private String adminName;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public AdminUserInitializer(UserJpaRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.trim().isEmpty() || 
            adminPassword == null || adminPassword.trim().isEmpty()) {
            return;
        }

        adminEmail = adminEmail.trim();
        adminPassword = adminPassword.trim();
        adminName = adminName != null ? adminName.trim() : "Admin";

        long adminCount = userRepository.countByRole(Role.ROLE_ADMIN);

        if (adminCount == 0) {
            UserEntity admin = new UserEntity(
                    adminName.isEmpty() ? "Admin" : adminName,
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
        }
    }
}
