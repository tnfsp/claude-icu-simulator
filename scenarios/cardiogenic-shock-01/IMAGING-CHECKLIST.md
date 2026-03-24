# Imaging Checklist — cardiogenic-shock-01
> Cardiogenic Shock Mimicking Sepsis | 68M, post-STEMI day 3

## Echo ✅ Done
- [x] PLAX — severely reduced LV, apical ballooning → `takotsubo/plax.mp4` (LITFL Case 091)
- [x] PSAX — global hypokinesis, RWMA → `takotsubo/psax-1.mp4` (LITFL Case 091)
- [x] A4C — dilated LV, apical akinesis → `takotsubo/a4c.mp4` (LITFL Case 091)
- [x] Subcostal — no significant effusion → `cardiac-tamponade/subcostal.mp4` (LITFL Case 005)
- [x] IVC — dilated >2.1cm, <50% collapse → `cardiac-tamponade/ivc.mp4` (LITFL Case 005)
- [x] Lung US — bilateral B-lines → `lung-b-lines/b-lines.mp4` (LITFL)

**Note**: Using takotsubo videos as proxy for post-MI low EF. Clinically acceptable — both show severe LV dysfunction with RWMA. Ideal would be a dedicated post-MI case, but LITFL doesn't have one with isolated LV failure.

**Note**: Subcostal and IVC videos are from cardiac tamponade case — the subcostal finding text says "no significant effusion" which somewhat contradicts the video showing effusion. Consider sourcing a normal subcostal view, or noting this discrepancy to learners.

## CXR 🔲 Needed
- [ ] **Pulmonary edema + cardiomegaly** — this is THE CXR for cardiogenic shock
  - Expected findings: bilateral perihilar haziness (butterfly pattern), Kerley B lines, cardiomegaly (CTR >0.5), upper lobe venous distension
  - Source: LITFL CXR page → `litfl.com/pulmonary-oedema-chest-x-ray/`
  - Backup: NIH ChestX-ray14 (filter: Edema + Cardiomegaly labels)
  - Save to: `public/assets/cxr/pulmonary-edema-cardiomegaly/`
- [ ] Add to scenario.json as `cxr_findings` field

## EKG 🔲 Needed
- [ ] **Sinus tachycardia + old anterior STEMI changes** — the patient is 3 days post-LAD PCI
  - Expected: sinus tachy ~120, Q waves in V1-V4, possible persistent ST elevation (early post-MI), poor R-wave progression
  - Source: LITFL ECG Library → anterior STEMI evolution page
  - Backup: PhysioNet ECG databases
  - Save to: `public/assets/ekg/sinus-tachy-old-stemi/`
- [ ] Add to scenario.json as `ekg_findings` field

## CT ❌ Not needed
- This scenario doesn't require CT — diagnosis is clinical + echo + CXR
- CT would only be relevant if differential includes PE/dissection, but echo + clinical picture suffices

## Attribution Tracking
| Asset | Source | License | Status |
|-------|--------|---------|--------|
| Echo PLAX/PSAX/A4C | LITFL Case 091 | CC-BY-NC-SA 4.0 | ✅ |
| Echo subcostal/IVC | LITFL Case 005 | CC-BY-NC-SA 4.0 | ✅ |
| Echo lung B-lines | LITFL | CC-BY-NC-SA 4.0 | ✅ |
| CXR pulmonary edema | TBD | TBD | 🔲 |
| EKG sinus tachy + old STEMI | TBD | TBD | 🔲 |
