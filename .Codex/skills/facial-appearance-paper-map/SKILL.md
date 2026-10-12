---
name: facial-appearance-paper-map
description: Build a reproducible cross-disciplinary paper map for predicting facial appearance changes from age/growth, weight/body-composition change, or treatment/intervention. Use for the facial-appearance-outcome-prediction research project before selecting papers for full-text review.
---

# Facial Appearance Outcome Prediction: Paper Map

Create an auditable paper pool and field map before attempting a full survey. Keep this reconnaissance stage separate from full-text synthesis and publication.

For API endpoint details, response parsing, pagination, and lawful open-access lookup, use the sibling `paper-lookup` skill and read only the relevant reference files. Do not use its broad database catalog as a reason to query every service.

## Scope the prediction task first

For each paper, identify:

- **Input**: 2D photo, 3D surface scan/mesh, CT/CBCT, dental scan, demographics, family data, or combinations.
- **Condition/change**: target age or growth interval, weight/BMI/body-fat change, or named treatment/intervention.
- **Output**: landmarks, skeletal/soft-tissue geometry, 3D mesh, profile, or a full rendered face.
- **Prediction unit**: population-average transformation, conditional synthesis, or same-person future/outcome prediction.
- **Evidence design**: cross-sectional cohort, longitudinal repeated scans, paired pre/post intervention, synthetic-only evaluation, or clinical/external validation.

Never conflate a plausible conditional image with an accurate forecast for an individual. Separate age progression from same-person longitudinal growth, statistical weight/face association from pre/post weight-loss outcomes, and skeletal/profile prediction from complete photographic outcome generation.

## Search in complementary sources

1. **OpenAlex** for broad multidisciplinary discovery and reference/citation expansion.
2. **PubMed** and, when useful, Europe PMC/PMC for clinical and biomedical studies.
3. **arXiv** for preprints and computer-vision methods. Add relevant IEEE/CVF, ACM, journal, or institutional records through their official search pages when indexing gaps are likely.
4. **Crossref** for DOI and publication metadata checks; **Semantic Scholar** or **OpenCitations** can supplement citation links.
5. Use Scopus only when an API key and the user's institution/account provide the necessary entitlement. An API key alone does not establish subscription access; never make the search plan depend on Scopus.

Read the sibling `paper-lookup` reference for each API before making calls. Respect rate limits, inspect response bodies as well as HTTP status, and record the database, endpoint/query, date, and result count. Search broadly first, then refine terminology after inspecting relevant titles and abstracts.

### Query blocks

Combine task terms with face/appearance terms and, where useful, input or validation terms:

- **Age/growth**: `facial aging`, `age progression`, `facial growth`, `longitudinal facial growth`, `3D facial growth`, `craniofacial growth`, `synthetic aging`.
- **Weight/body composition**: `weight change`, `weight loss`, `facial adiposity`, `facial soft tissue`, `BMI`, `body composition`, `before and after weight loss`.
- **Treatment/intervention**: `facial outcome prediction`, `orthodontic profile prediction`, `orthognathic surgery prediction`, `orthognathic soft tissue`, `maxillofacial surgery`, `plastic surgery outcome`, `facial reconstruction`.
- **Methods/evaluation**: `3D face`, `facial mesh`, `longitudinal`, `paired preoperative postoperative`, `conditional generation`, `external validation`, `clinical evaluation`, `uncertainty`.

Example combinations (adapt syntax to each database):

- `("facial growth" OR "facial aging" OR "age progression") AND (longitudinal OR prediction OR generation)`
- `("weight loss" OR "weight change" OR BMI) AND (face OR facial) AND (longitudinal OR outcome OR prediction)`
- `(orthodontic OR orthognathic OR maxillofacial OR plastic surgery) AND (facial OR soft tissue OR profile) AND (prediction OR outcome)`

## Build and enrich the paper pool

- Deduplicate first by DOI, then arXiv ID/PMID/other stable identifiers, then normalized title. Link preprint, conference/journal version, protocol, and follow-up reports when they describe the same study; do not erase those report relationships.
- Store at least: title, authors, year, venue, DOI and other IDs, abstract, canonical URL, database, search query/date, branch, input/change/output, population/data type, study design, prediction unit, validation, peer-review/preprint status, access status, and screening note.
- Keep **citation count** separate from **citation links**. A `cited_by_count` is a database-specific count captured on a date; it is not a list of citing papers and is not a quality score. Retrieve `referenced_works` and `cited_by` works separately when the source supports them. Record source and retrieval date, then use backward references and forward citations to identify foundational methods, datasets, replications, and criticism.
- Use citation counts only to prioritize exploratory reading. Do not use them as inclusion criteria or evidence quality ratings.

## Resolve access without overstating evidence

For each candidate, seek full text in this order: publisher open version; Unpaywall OA locations; PMC/Europe PMC; arXiv or another author preprint; institutional/author repository; library or interlibrary access; author contact. Record the exact accessible version and URL.

If full text cannot be obtained, retain the record with `full_text_status=not_retrieved`, note attempts and available metadata/abstract, and limit claims to what those sources establish. Do not infer methods, results, or limitations from search snippets. Do not invoke Sci-Hub or another unauthorized access route.

## Deliverables and stopping point

For paper-pool reconnaissance, produce:

- `field-map.md`: task definitions, branches, search scope, known terminology gaps, and evidence boundaries.
- `paper-pool.csv`: deduplicated records with branch, study design, prediction unit, validation, access, and citation provenance.
- `search-log.md`: databases, query strings, dates, counts, deduplication/screening decisions, API limitations, and coverage caveats.

Stop after the paper pool and field map unless the user asks for full-text review, synthesis, or publication. Recommend a staged deep-reading shortlist based on longitudinal or paired intervention evidence, clinically relevant validation, and external generalization—not citation count alone.
