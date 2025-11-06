package com.example.kafka.coursera.services;

import com.example.kafka.coursera.db.entities.Translation;
import com.example.kafka.coursera.db.enums.LanguageEnum;
import com.example.kafka.coursera.db.repositories.TranslationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TranslationService {
    private final TranslationRepository translationRepository;

    public String translate(String key, LanguageEnum language) {
        if (language == null) {
            return getDefaultTranslation(key);
        }

        Optional<Translation> translation = translationRepository.findByName(key);
        if (translation.isEmpty()) {
            return getDefaultTranslation(key);
        }

        Translation t = translation.get();
        switch (language) {
            case EN:
                return t.getEn() != null ? t.getEn() : getDefaultTranslation(key);
            case RU:
                return t.getRu() != null ? t.getRu() : getDefaultTranslation(key);
            case ES:
                return t.getEs() != null ? t.getEs() : getDefaultTranslation(key);
            default:
                return getDefaultTranslation(key);
        }
    }

    private String getDefaultTranslation(String key) {
        return key + " (No translation available)";
    }
}
