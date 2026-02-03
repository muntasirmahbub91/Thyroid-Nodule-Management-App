import 'package:flutter/material.dart';

class AppColors {
  // Primary Teal
  static const Color teal700 = Color(0xFF0F766E);
  static const Color teal600 = Color(0xFF0D9488);
  static const Color teal50 = Color(0xFFF0FDFA);

  // Stone Neutrals
  static const Color stone50 = Color(0xFFFAFAF9);
  static const Color stone100 = Color(0xFFF5F5F4);
  static const Color stone200 = Color(0xFFE7E5E4);
  static const Color stone500 = Color(0xFF78716C);
  static const Color stone800 = Color(0xFF292524);

  // Status Colors
  static const Color danger = Color(0xFFB91C1C);
  static const Color warning = Color(0xFFD97706);
  static const Color success = Color(0xFF059669);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.teal600,
        primary: AppColors.teal600,
        surface: AppColors.stone50,
        onSurface: AppColors.stone800,
        background: AppColors.stone50,
      ),
      scaffoldBackgroundColor: AppColors.stone50,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.teal700,
        elevation: 1,
        shadowColor: Colors.black26,
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.stone200),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: AppColors.stone800, fontWeight: FontWeight.bold),
        titleLarge: TextStyle(color: AppColors.teal700, fontWeight: FontWeight.bold),
        bodyLarge: TextStyle(color: AppColors.stone800),
        bodySmall: TextStyle(color: AppColors.stone500),
      ),
    );
  }
}
