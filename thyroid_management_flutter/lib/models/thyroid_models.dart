enum DataSource {
  clinical,
  endoscopy,
  us,
  fnac,
  ct,
  mri,
  petct,
  cbct,
  pathology,
  virology,
  lab
}

class Provenanced<T> {
  final T value;
  final DataSource? source;
  final String? date;
  final String? note;

  Provenanced({required this.value, this.source, this.date, this.note});
}

class Biomarkers {
  final double? tgNgMl;
  final bool? tgAb;
  final double? calcitoninPgMl;
  final double? ceaNgMl;
  final String? retGermlineResult; // "pathogenic" | "VUS" | "negative"
  final bool? brafV600e;
  final bool? retFusion;
  final bool? ntrkFusion;
  final bool? alkFusion;
  final bool? msiDmmr;
  final bool? tmbHigh;

  Biomarkers({
    this.tgNgMl,
    this.tgAb,
    this.calcitoninPgMl,
    this.ceaNgMl,
    this.retGermlineResult,
    this.brafV600e,
    this.retFusion,
    this.ntrkFusion,
    this.alkFusion,
    this.msiDmmr,
    this.tmbHigh,
  });
}

enum ThyroidHistology {
  dtcPapillary,
  dtcFollicular,
  dtcOncocytic,
  mtc,
  atc
}

class USFeatures {
  final String composition; // "solid" | "part_cystic" | "pure_cyst" | "spongiform"
  final String echogenicity; // "markedly_hypoechoic" | "hypoechoic" | "isoechoic" | "hyperechoic"
  final String margins; // 'smooth' | 'irregular' | 'lobulated' | 'ill_defined'
  final String shape; // 'taller_than_wide' | 'wider_than_tall'
  final String calcifications; // 'microcalcifications' | 'macrocalcifications' | 'none'
  final String vascularity; // 'none' | 'peripheral' | 'central'
  final bool extrathyroidalExtension;
  final double? maxDiameterMm;

  USFeatures({
    required this.composition,
    required this.echogenicity,
    required this.margins,
    required this.shape,
    required this.calcifications,
    required this.vascularity,
    required this.extrathyroidalExtension,
    this.maxDiameterMm,
  });
}

class PostOpHistology {
  final String finalHistology; // "PTC" | "FTC" | "Oncocytic" | "NIFTP" | "Poorly-differentiated"
  final String marginStatus; // "negative" | "close" | "positive"
  final bool grossEte;
  final String vascularInvasionVessels; // "none" | "1-3" | ">=4"
  final bool widelyInvasive;
  final bool nodesPathPositive;

  PostOpHistology({
    required this.finalHistology,
    required this.marginStatus,
    required this.grossEte,
    required this.vascularInvasionVessels,
    required this.widelyInvasive,
    required this.nodesPathPositive,
  });
}

class NoduleCaseInput {
  final double? tsh;
  final String nuclearScan; // "unknown" | "hot" | "cold"
  final bool continueDespiteLowTsh;
  final String guideline; // "ATA" | "BTA"
  final USFeatures features;
  final bool nodeSuspicious;
  final bool calcitoninElevated;
  
  final String? assignedPattern;
  final String? assignedU;

  final String cytologySystem; // "Bethesda" | "RCPath_Thy"
  final String bethesdaCat;
  final String rcpathThy;

  final PostOpHistology? postOpHistology;

  NoduleCaseInput({
    this.tsh,
    required this.nuclearScan,
    required this.continueDespiteLowTsh,
    required this.guideline,
    required this.features,
    required this.nodeSuspicious,
    required this.calcitoninElevated,
    this.assignedPattern,
    this.assignedU,
    required this.cytologySystem,
    required this.bethesdaCat,
    required this.rcpathThy,
    this.postOpHistology,
  });
}
