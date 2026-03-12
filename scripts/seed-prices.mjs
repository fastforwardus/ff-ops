import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
config({ path: ".env.local" })
const sql = neon(process.env.DATABASE_URL)

const services = [
  // Alimentos y bebidas
  { key: "fda_food_registration",  labelEn: "FDA Food Establishment Registration",     labelEs: "Registro Establecimiento FDA (Alimentos)",  priceUsd: 595,  category: "food", sortOrder: 1 },
  { key: "fda_food_renewal",       labelEn: "FDA Food Establishment Renewal",          labelEs: "Renovación Establecimiento FDA (Alimentos)", priceUsd: 499,  category: "food", sortOrder: 2 },
  { key: "fda_canned_facility",    labelEn: "FDA Canned/Acidified - Facility",         labelEs: "FDA Enlatados/Acidificados - Establecimiento", priceUsd: 950, category: "food", sortOrder: 3 },
  { key: "fda_canned_product",     labelEn: "FDA Canned/Acidified - Per product",      labelEs: "FDA Enlatados/Acidificados - Por producto",  priceUsd: 195,  category: "food", sortOrder: 4 },
  { key: "fda_label_first",        labelEn: "FDA Label Review (first label)",          labelEs: "Revisión de etiqueta FDA (primera)",         priceUsd: 595,  category: "food", sortOrder: 5 },
  { key: "fda_label_additional",   labelEn: "FDA Label Review (additional)",           labelEs: "Revisión de etiqueta FDA (adicionales)",     priceUsd: 185,  category: "food", sortOrder: 6 },
  { key: "fsvp",                   labelEn: "FSVP",                                    labelEs: "FSVP",                                       priceUsd: 395,  category: "food", sortOrder: 7 },
  // Bebidas alcohólicas
  { key: "fl_license_wine_beer",   labelEn: "Florida License - Wine & Beer",           labelEs: "Licencia Florida - Vino y Cerveza",          priceUsd: 6000, category: "alcohol", sortOrder: 10 },
  { key: "fl_license_spirits",     labelEn: "Florida License - Spirits",               labelEs: "Licencia Florida - Bebidas espirituosas",    priceUsd: 7500, category: "alcohol", sortOrder: 11 },
  // Cosméticos / Pharma / Devices
  { key: "fda_cosm_registration",  labelEn: "FDA Cosmetics Establishment Registration", labelEs: "Registro Establecimiento FDA (Cosméticos)", priceUsd: 595,  category: "cosmetics", sortOrder: 20 },
  { key: "fda_pharma_registration",labelEn: "FDA Pharma Establishment Registration",   labelEs: "Registro Establecimiento FDA (Farmacéuticos)", priceUsd: 595, category: "pharma", sortOrder: 21 },
  { key: "fda_devices_registration",labelEn:"FDA Medical Devices Registration",        labelEs: "Registro FDA Dispositivos Médicos",          priceUsd: 595,  category: "devices", sortOrder: 22 },
  { key: "fda_product_registration",labelEn:"FDA Product Registration",                labelEs: "Registro de producto FDA",                   priceUsd: 195,  category: "cosmetics", sortOrder: 23 },
  { key: "fda_label_cosm",         labelEn: "Label Review - Cosmetics/Pharma (first)", labelEs: "Revisión de etiqueta - Cosméticos (primera)", priceUsd: 595, category: "cosmetics", sortOrder: 24 },
  { key: "fda_label_cosm_add",     labelEn: "Label Review - Cosmetics/Pharma (add.)", labelEs: "Revisión de etiqueta - Cosméticos (adicionales)", priceUsd: 185, category: "cosmetics", sortOrder: 25 },
  // USDA / NOAA / USFWS
  { key: "usda_produce",           labelEn: "USDA Fruits & Vegetables",                labelEs: "USDA Frutas y Verduras",                     priceUsd: 1500, category: "usda", sortOrder: 30 },
  { key: "usda_vs_permit",         labelEn: "USDA VS Permit",                          labelEs: "USDA VS Permit",                             priceUsd: 1500, category: "usda", sortOrder: 31 },
  { key: "noaa_fisheries",         labelEn: "NOAA Fisheries",                          labelEs: "NOAA Fisheries",                             priceUsd: 1500, category: "usda", sortOrder: 32 },
  { key: "usfws",                  labelEn: "USFWS",                                   labelEs: "USFWS",                                      priceUsd: 950,  category: "usda", sortOrder: 33 },
  // Empresa y marca
  { key: "llc_miami",              labelEn: "LLC Miami",                               labelEs: "LLC Miami",                                  priceUsd: 1100, category: "business", sortOrder: 40 },
  { key: "operating_agreement",    labelEn: "Operating Agreement",                     labelEs: "Operating Agreement",                        priceUsd: 450,  category: "business", sortOrder: 41 },
  { key: "uspto_basic",            labelEn: "USPTO Trademark - Basic",                 labelEs: "USPTO Marca - Básica",                       priceUsd: 2000, category: "business", sortOrder: 42 },
  { key: "uspto_premium",          labelEn: "USPTO Trademark - Premium",               labelEs: "USPTO Marca - Premium",                      priceUsd: 3000, category: "business", sortOrder: 43 },
  // Recurrentes
  { key: "us_agent_inbox",         labelEn: "US Agent Inbox® (monthly)",               labelEs: "US Agent Inbox® (mensual)",                  priceUsd: 99,   category: "recurring", sortOrder: 50 },
  { key: "bpm_course",             labelEn: "BPM Course (per person)",                 labelEs: "Curso BPM (por persona)",                    priceUsd: 299,  category: "recurring", sortOrder: 51 },
]

for (const s of services) {
  await sql`
    INSERT INTO services (id, key, label_en, label_es, price_usd, category, active, sort_order)
    VALUES (gen_random_uuid(), ${s.key}, ${s.labelEn}, ${s.labelEs}, ${s.priceUsd}, ${s.category}, true, ${s.sortOrder})
    ON CONFLICT (key) DO NOTHING
  `
}
console.log(`✓ ${services.length} servicios cargados`)
