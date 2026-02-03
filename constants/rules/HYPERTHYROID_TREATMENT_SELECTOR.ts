export const HYPERTHYROID_TREATMENT_SELECTOR = {
    module: "HYPERTHYROID_TREATMENT_SELECTOR_V1",
    version: "1.0.0",
    description: "Selects therapy for Toxic Adenoma, TMNG, or Graves.",
    inputs: ["etiology", "compressive_symptoms", "patient_preference", "pregnancy"],
    rules: [
        {
            id: "PREGNANCY_ATD_ONLY",
            priority: 900,
            when: { pregnant: true },
            then: {
                recommendation: "ATD_LONG_TERM",
                forbidden: ["RAI"],
                reason: "RAI contraindicated in pregnancy. Surgery only for refractory cases."
            }
        },
        {
            id: "TOXIC_ADENOMA_RAI",
            priority: 650,
            when: {
                etiology: "TOXIC_ADENOMA",
                compressive_symptoms: false,
                preference: "RAI"
            },
            then: {
                recommendation: "RAI",
                reason: "Effective cure for single hot nodule without compression."
            }
        },
        {
            id: "COMPRESSIVE_GOITER_SURGERY",
            priority: 640,
            when: { compressive_symptoms: true },
            then: {
                recommendation: "SURGERY",
                reason: "Mechanical relief required. RAI/Meds will not sufficiently reduce volume."
            }
        }
    ]
};
