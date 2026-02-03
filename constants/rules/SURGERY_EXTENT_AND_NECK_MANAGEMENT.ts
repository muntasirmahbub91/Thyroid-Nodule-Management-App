export const SURGERY_EXTENT_AND_NECK_MANAGEMENT = {
    module: "SURGERY_EXTENT_AND_NECK_MANAGEMENT_V1",
    version: "1.0.0",
    inputs: ["malignancy_confirmed", "nodal_status", "tumor_size", "multifocality", "extrathyroidal_extension"],
    rules: [
        {
            id: "LATERAL_NECK_DISSECTION",
            priority: 900,
            when: { nodal_status: "cN1b" },
            then: {
                thyroid: "TOTAL_THYROIDECTOMY",
                neck: "THERAPEUTIC_LATERAL_DISSECTION",
                reason: "Lateral nodal metastasis requires comprehensive clearance."
            }
        },
        {
            id: "TOTAL_THYROID_HIGH_RISK",
            priority: 850,
            when: {
                any: [
                    { gross_ete: true },
                    { distant_metastasis: true },
                    { bilateral_disease: true },
                    { size_cm: "> 4.0" }
                ]
            },
            then: {
                thyroid: "TOTAL_THYROIDECTOMY",
                neck: "CONSIDER_CENTRAL_NECK",
                reason: "High-risk features favor Total Thyroidectomy."
            }
        },
        {
            id: "LOBECTOMY_LOW_RISK_DTC",
            priority: 800,
            when: {
                malignancy_confirmed: true,
                nodal_status: "cN0",
                size_cm: "<= 4.0",
                gross_ete: false,
                multifocality: false
            },
            then: {
                thyroid: "LOBECTOMY",
                neck: "NONE",
                reason: "Low-risk intrathyroidal cancer is eligible for Lobectomy (ATA 2015)."
            }
        }
    ]
};
