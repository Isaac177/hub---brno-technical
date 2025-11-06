package com.example.courseService.utils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.text.similarity.LevenshteinDistance;

public class SimilarityUtils {

        // Jaccard Similarity for Tags
        public static double calculateJaccardSimilarity(Set<String> set1, Set<String> set2) {
                Set<String> intersection = new HashSet<>(set1);
                intersection.retainAll(set2);

                Set<String> union = new HashSet<>(set1);
                union.addAll(set2);

                return (double) intersection.size() / union.size();
        }

        // Levenshtein Similarity for Strings (Title, Description)
        public static double calculateLevenshteinSimilarity(String str1, String str2) {
                LevenshteinDistance levenshtein = new LevenshteinDistance();
                int distance = levenshtein.apply(str1, str2);
                int maxLen = Math.max(str1.length(), str2.length());
                return (maxLen == 0) ? 1.0 : (1.0 - (double) distance / maxLen);
        }

        // Price similarity with tolerance, adjusting for price difference
        public static double calculatePriceSimilarity(double price1, double price2) {
                double tolerance = 0.10; // 10% tolerance
                double priceDifference = Math.abs(price1 - price2);
                double maxPrice = Math.max(price1, price2);
                return (priceDifference <= tolerance * maxPrice) ? 1.0 : 1.0 - (priceDifference / maxPrice);
        }

        public static double calculateJaccardSimilarityForUUIDs(List<UUID> list1, List<UUID> list2) {
                Set<UUID> set1 = new HashSet<>(list1);
                Set<UUID> set2 = new HashSet<>(list2);

                Set<UUID> intersection = new HashSet<>(set1);
                intersection.retainAll(set2);

                Set<UUID> union = new HashSet<>(set1);
                union.addAll(set2);

                return (double) intersection.size() / union.size();
        }
}
