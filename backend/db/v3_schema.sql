-- ============================================================================
-- iPaCX RIS/PACS v3.0 Enterprise Database Schema
-- Author: Advanced Healthcare IT Architect
-- Description: Modern, normalized PostgreSQL schema with JSONB metadata support
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS v3_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'RADIOLOGIST', -- ADMIN, RADIOLOGIST, TECHNICIAN, REFERRING_PHYSICIAN
    doctor_signature_url TEXT,
    medical_license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PATIENTS EHR REGISTRY
CREATE TABLE IF NOT EXISTS v3_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn VARCHAR(100) UNIQUE NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    dob DATE,
    gender VARCHAR(10) DEFAULT 'O',
    phone VARCHAR(30),
    email VARCHAR(150),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PACS NODES & ARCHIVES
CREATE TABLE IF NOT EXISTS v3_pacs_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_name VARCHAR(100) NOT NULL,
    pacs_type VARCHAR(50) NOT NULL DEFAULT 'ORTHANC', -- ORTHANC, DCM4CHEE, DICOMWEB, VNA
    ae_title VARCHAR(64) NOT NULL DEFAULT 'ORTHANC',
    ip_address VARCHAR(100) NOT NULL DEFAULT '127.0.0.1',
    port INT NOT NULL DEFAULT 8042,
    username VARCHAR(100) DEFAULT 'orthanc',
    password VARCHAR(100) DEFAULT 'orthanc',
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DICOM STUDIES REGISTRY
CREATE TABLE IF NOT EXISTS v3_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_uid VARCHAR(128) UNIQUE NOT NULL,
    patient_mrn VARCHAR(100) REFERENCES v3_patients(mrn) ON DELETE SET NULL,
    patient_name VARCHAR(200),
    accession_number VARCHAR(100),
    modality VARCHAR(20) NOT NULL DEFAULT 'CR',
    study_description TEXT,
    study_date VARCHAR(20),
    study_time VARCHAR(20),
    referring_physician VARCHAR(150),
    total_series INT DEFAULT 0,
    total_instances INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'UNREPORTED', -- UNREPORTED, DRAFT, FINALIZED, VERIFIED
    pacs_node_id UUID REFERENCES v3_pacs_nodes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DETERMINISTIC KEY IMAGE REGISTRY
CREATE TABLE IF NOT EXISTS v3_key_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_uid VARCHAR(128) NOT NULL REFERENCES v3_studies(study_uid) ON DELETE CASCADE,
    series_uid VARCHAR(128) NOT NULL,
    sop_instance_uid VARCHAR(128) NOT NULL,
    slice_number INT NOT NULL DEFAULT 1,
    frame_number INT DEFAULT 1,
    modality VARCHAR(20) DEFAULT 'CT',
    series_description VARCHAR(255),
    data_url TEXT NOT NULL, -- Compressed JPEG Base64 (<150 KB)
    caption TEXT,
    window_center NUMERIC DEFAULT 1.0,
    window_width NUMERIC DEFAULT 1.0,
    zoom NUMERIC DEFAULT 1.0,
    rotation INT DEFAULT 0,
    annotations_json JSONB DEFAULT '{}'::jsonb,
    captured_by_user_id UUID REFERENCES v3_users(id) ON DELETE SET NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. STRUCTURED RADIOLOGY REPORTS & AI IMPRESSIONS
CREATE TABLE IF NOT EXISTS v3_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_uid VARCHAR(128) UNIQUE NOT NULL REFERENCES v3_studies(study_uid) ON DELETE CASCADE,
    patient_mrn VARCHAR(100),
    radiologist_id UUID REFERENCES v3_users(id) ON DELETE SET NULL,
    findings_text TEXT,
    findings_html TEXT,
    impression_text TEXT,
    impression_html TEXT,
    icd_codes JSONB DEFAULT '[]'::jsonb,
    key_image_ids UUID[] DEFAULT ARRAY[]::UUID[],
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, FINALIZED, AMENDED
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AI INFERENCE JOBS REGISTRY
CREATE TABLE IF NOT EXISTS v3_ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_uid VARCHAR(128) NOT NULL REFERENCES v3_studies(study_uid) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL DEFAULT 'Gemini-Radiology-Pro',
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    prompt_payload JSONB DEFAULT '{}'::jsonb,
    result_json JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. SECURITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS v3_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES v3_users(id) ON DELETE SET NULL,
    action_event VARCHAR(100) NOT NULL,
    resource_page VARCHAR(100),
    details_json JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS v3_system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-SPEED QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_v3_studies_study_uid ON v3_studies(study_uid);
CREATE INDEX IF NOT EXISTS idx_v3_studies_status ON v3_studies(status);
CREATE INDEX IF NOT EXISTS idx_v3_key_images_study_uid ON v3_key_images(study_uid);
CREATE INDEX IF NOT EXISTS idx_v3_reports_study_uid ON v3_reports(study_uid);
CREATE INDEX IF NOT EXISTS idx_v3_ai_jobs_study_uid ON v3_ai_jobs(study_uid);
