package com.example.kafka.coursera.configs;

import com.example.kafka.coursera.db.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Locale;

@Configuration
@RequiredArgsConstructor
public class UserPreferencesLocaleResolver extends AcceptHeaderLocaleResolver {
    private final UserRepository userRepository;

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        // User preferences will be handled by the system
        return Locale.getDefault();
    }

    @Override
    public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
        throw new UnsupportedOperationException("Not Supported");
    }
}
